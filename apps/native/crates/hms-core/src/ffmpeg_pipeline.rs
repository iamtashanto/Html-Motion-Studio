use crate::models::{
    AudioStreamInfo, DesktopExportJobConfig, DesktopSystemCapabilities, FFprobeValidationResult,
    VideoStreamInfo,
};
use crate::platform::{os_name, resolve_binary, resolve_chromium_binary};
use anyhow::{bail, Context, Result};
use serde_json::Value;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

pub struct FFmpegPipeline {
    ffmpeg_path: PathBuf,
    ffprobe_path: PathBuf,
    active_pid: Arc<Mutex<Option<u32>>>,
    cancelled: Arc<AtomicBool>,
}

pub struct StreamingEncoder {
    child: Child,
    stdin: Option<ChildStdin>,
    output_path: PathBuf,
    active_pid: Arc<Mutex<Option<u32>>>,
    cancelled: Arc<AtomicBool>,
}

impl StreamingEncoder {
    pub fn write_png_frame(&mut self, png_bytes: &[u8]) -> Result<()> {
        if self.cancelled.load(Ordering::SeqCst) {
            bail!("Export was cancelled by user.");
        }
        if let Some(stdin) = self.stdin.as_mut() {
            stdin
                .write_all(png_bytes)
                .with_context(|| "Failed to write PNG frame to FFmpeg stdin pipe")?;
        }
        Ok(())
    }

    pub fn finish(mut self) -> Result<PathBuf> {
        // Closing stdin signals EOF to FFmpeg so it flushes and finalizes the container
        drop(self.stdin.take());
        let output = self.child.wait_with_output()?;
        if let Ok(mut pid) = self.active_pid.lock() {
            *pid = None;
        }
        if self.cancelled.load(Ordering::SeqCst) {
            let _ = std::fs::remove_file(&self.output_path);
            bail!("Export was cancelled by user.");
        }
        if !output.status.success() || !self.output_path.is_file() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            bail!(
                "FFmpeg exited with status {:?}. Stderr:\n{}",
                output.status.code(),
                stderr
            );
        }
        Ok(self.output_path)
    }

    pub fn abort(mut self) {
        drop(self.stdin.take());
        let _ = self.child.kill();
        let _ = self.child.wait();
        if let Ok(mut pid) = self.active_pid.lock() {
            *pid = None;
        }
    }
}

impl FFmpegPipeline {
    pub fn new() -> Self {
        let ffmpeg_path =
            resolve_binary("ffmpeg", "FFMPEG_PATH").unwrap_or_else(|| PathBuf::from("ffmpeg"));
        let ffprobe_path =
            resolve_binary("ffprobe", "FFPROBE_PATH").unwrap_or_else(|| PathBuf::from("ffprobe"));
        Self {
            ffmpeg_path,
            ffprobe_path,
            active_pid: Arc::new(Mutex::new(None)),
            cancelled: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn get_system_capabilities(&self) -> DesktopSystemCapabilities {
        let (ffmpeg_available, ffmpeg_version) = match Command::new(&self.ffmpeg_path)
            .arg("-version")
            .output()
        {
            Ok(out) if out.status.success() => {
                let first = String::from_utf8_lossy(&out.stdout)
                    .lines()
                    .next()
                    .unwrap_or("FFmpeg available")
                    .to_string();
                (true, first)
            }
            _ => (false, String::new()),
        };

        let (ffprobe_available, ffprobe_version) = match Command::new(&self.ffprobe_path)
            .arg("-version")
            .output()
        {
            Ok(out) if out.status.success() => {
                let first = String::from_utf8_lossy(&out.stdout)
                    .lines()
                    .next()
                    .unwrap_or("FFprobe available")
                    .to_string();
                (true, first)
            }
            _ => (false, String::new()),
        };

        let chromium = resolve_chromium_binary();
        let chromium_available = chromium.is_some();
        let chromium_path = chromium
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default();

        DesktopSystemCapabilities {
            os: os_name().to_string(),
            arch: std::env::consts::ARCH.to_string(),
            ffmpeg_available,
            ffmpeg_path: self.ffmpeg_path.to_string_lossy().to_string(),
            ffmpeg_version,
            ffprobe_available,
            ffprobe_path: self.ffprobe_path.to_string_lossy().to_string(),
            ffprobe_version,
            chromium_available,
            chromium_path,
            gpu_acceleration: cfg!(any(target_os = "macos", target_os = "windows")),
        }
    }

    /// Spawns a zero-disk-I/O streaming FFmpeg process that reads PNG frames directly from stdin.
    pub fn spawn_streaming_encoder(&self, config: &DesktopExportJobConfig) -> Result<StreamingEncoder> {
        self.cancelled.store(false, Ordering::SeqCst);

        let output_path = PathBuf::from(&config.output_file_path);
        if let Some(parent) = output_path.parent() {
            if !parent.as_os_str().is_empty() {
                std::fs::create_dir_all(parent)?;
            }
        }
        if output_path.exists() {
            let _ = std::fs::remove_file(&output_path);
        }

        let settings = &config.settings;
        let audio = &config.audio_settings;
        let format = settings.format.to_ascii_lowercase();
        let is_webm = format == "webm";
        let is_prores = format == "mov";

        let width = if settings.width % 2 == 0 {
            settings.width
        } else {
            settings.width + 1
        };
        let height = if settings.height % 2 == 0 {
            settings.height
        } else {
            settings.height + 1
        };

        let mut args: Vec<String> = vec![
            "-y".into(),
            "-f".into(),
            "image2pipe".into(),
            "-vcodec".into(),
            "png".into(),
            "-framerate".into(),
            settings.fps.to_string(),
            "-i".into(),
            "-".into(),
        ];

        let has_audio = config
            .audio_file_path
            .as_deref()
            .filter(|p| !p.is_empty() && Path::new(p).is_file())
            .is_some()
            && audio.source_mode != "none";

        if has_audio {
            if let Some(audio_path) = &config.audio_file_path {
                args.push("-i".into());
                args.push(audio_path.clone());
            }
        }

        // Video codec options
        if is_webm {
            args.extend([
                "-c:v".into(),
                "libvpx-vp9".into(),
                "-b:v".into(),
                format!("{}M", settings.video_bitrate_mbps.max(2)),
                "-pix_fmt".into(),
                "yuva420p".into(),
            ]);
        } else if is_prores {
            args.extend([
                "-c:v".into(),
                "prores_ks".into(),
                "-profile:v".into(),
                "4".into(),
                "-pix_fmt".into(),
                "yuva444p10le".into(),
            ]);
        } else {
            let crf = match settings.quality.as_str() {
                "draft" => "24",
                "standard" => "20",
                "ultra" => "15",
                _ => "18",
            };
            args.extend([
                "-c:v".into(),
                "libx264".into(),
                "-preset".into(),
                "medium".into(),
                "-crf".into(),
                crf.into(),
                "-pix_fmt".into(),
                "yuv420p".into(),
            ]);
        }

        args.extend(["-vf".into(), format!("scale={width}:{height}")]);

        if has_audio {
            let mut filters = Vec::new();
            if (audio.volume - 1.0).abs() > 0.001 {
                filters.push(format!("volume={:.3}", audio.volume));
            }
            if audio.start_offset_seconds > 0.0 {
                let delay_ms = (audio.start_offset_seconds * 1000.0).round() as u64;
                filters.push(format!("adelay={delay_ms}|{delay_ms}"));
            }
            if audio.fade_in_seconds > 0.0 {
                filters.push(format!("afade=t=in:ss=0:d={:.3}", audio.fade_in_seconds));
            }
            if audio.fade_out_seconds > 0.0 {
                let st = (settings.duration_seconds - audio.fade_out_seconds).max(0.0);
                filters.push(format!("afade=t=out:st={st:.3}:d={:.3}", audio.fade_out_seconds));
            }
            if !filters.is_empty() {
                args.push("-af".into());
                args.push(filters.join(","));
            }
            if is_webm {
                args.extend([
                    "-c:a".into(),
                    "libopus".into(),
                    "-b:a".into(),
                    format!("{}k", settings.audio_bitrate_kbps),
                ]);
            } else {
                args.extend([
                    "-c:a".into(),
                    "aac".into(),
                    "-b:a".into(),
                    format!("{}k", settings.audio_bitrate_kbps),
                ]);
            }
            args.extend(["-t".into(), format!("{:.3}", settings.duration_seconds)]);
        } else {
            args.extend(["-an".into(), "-t".into(), format!("{:.3}", settings.duration_seconds)]);
        }

        if !is_webm && !is_prores {
            args.extend(["-movflags".into(), "+faststart".into()]);
        }

        args.push(output_path.to_string_lossy().to_string());

        let mut child = Command::new(&self.ffmpeg_path)
            .args(&args)
            .stdin(Stdio::piped())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .with_context(|| format!("Failed to spawn FFmpeg at {}", self.ffmpeg_path.display()))?;

        if let Ok(mut pid) = self.active_pid.lock() {
            *pid = Some(child.id());
        }

        let stdin = child.stdin.take();
        Ok(StreamingEncoder {
            child,
            stdin,
            output_path,
            active_pid: self.active_pid.clone(),
            cancelled: self.cancelled.clone(),
        })
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::SeqCst);
        if let Ok(mut guard) = self.active_pid.lock() {
            if let Some(pid) = guard.take() {
                #[cfg(unix)]
                {
                    let _ = Command::new("kill").args(["-TERM", &pid.to_string()]).status();
                }
                #[cfg(windows)]
                {
                    let _ = Command::new("taskkill")
                        .args(["/PID", &pid.to_string(), "/F"])
                        .status();
                }
            }
        }
    }

    pub fn verify_video(&self, file_path: &Path) -> FFprobeValidationResult {
        if !file_path.is_file() {
            return FFprobeValidationResult {
                valid: false,
                format_name: String::new(),
                duration_seconds: 0.0,
                size_bytes: 0,
                bitrate: 0,
                video: None,
                audio: None,
                error: Some(format!("File does not exist: {}", file_path.display())),
            };
        }

        let size_bytes = std::fs::metadata(file_path).map(|m| m.len()).unwrap_or(0);
        let output = match Command::new(&self.ffprobe_path)
            .args([
                "-v",
                "quiet",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
            ])
            .arg(file_path)
            .output()
        {
            Ok(o) if o.status.success() => o,
            Ok(o) => {
                return FFprobeValidationResult {
                    valid: false,
                    format_name: String::new(),
                    duration_seconds: 0.0,
                    size_bytes,
                    bitrate: 0,
                    video: None,
                    audio: None,
                    error: Some(format!(
                        "FFprobe failed: {}",
                        String::from_utf8_lossy(&o.stderr)
                    )),
                };
            }
            Err(e) => {
                return FFprobeValidationResult {
                    valid: false,
                    format_name: String::new(),
                    duration_seconds: 0.0,
                    size_bytes,
                    bitrate: 0,
                    video: None,
                    audio: None,
                    error: Some(format!("Failed to execute FFprobe: {e}")),
                };
            }
        };

        let meta: Value = match serde_json::from_slice(&output.stdout) {
            Ok(v) => v,
            Err(e) => {
                return FFprobeValidationResult {
                    valid: false,
                    format_name: String::new(),
                    duration_seconds: 0.0,
                    size_bytes,
                    bitrate: 0,
                    video: None,
                    audio: None,
                    error: Some(format!("Invalid FFprobe JSON: {e}")),
                };
            }
        };

        let format = &meta["format"];
        let streams = meta["streams"].as_array().cloned().unwrap_or_default();

        let video_stream = streams
            .iter()
            .find(|s| s["codec_type"].as_str() == Some("video"));
        let audio_stream = streams
            .iter()
            .find(|s| s["codec_type"].as_str() == Some("audio"));

        let video = video_stream.map(|s| {
            let fps = s["r_frame_rate"]
                .as_str()
                .and_then(|r| {
                    let mut parts = r.split('/');
                    let num: f64 = parts.next()?.parse().ok()?;
                    let den: f64 = parts.next().unwrap_or("1").parse().ok()?;
                    if den > 0.0 {
                        Some((num / den).round() as u32)
                    } else {
                        None
                    }
                })
                .unwrap_or(0);
            VideoStreamInfo {
                codec: s["codec_name"].as_str().unwrap_or("unknown").to_string(),
                width: s["width"].as_u64().unwrap_or(0) as u32,
                height: s["height"].as_u64().unwrap_or(0) as u32,
                fps,
                frame_count: s["nb_frames"]
                    .as_str()
                    .and_then(|v| v.parse::<u64>().ok()),
                pixel_format: s["pix_fmt"].as_str().map(String::from),
            }
        });

        let duration_seconds = format["duration"]
            .as_str()
            .and_then(|v| v.parse::<f64>().ok())
            .unwrap_or(0.0);

        let audio = audio_stream.map(|s| AudioStreamInfo {
            codec: s["codec_name"].as_str().unwrap_or("unknown").to_string(),
            sample_rate: s["sample_rate"]
                .as_str()
                .and_then(|v| v.parse::<u32>().ok())
                .unwrap_or(0),
            channels: s["channels"].as_u64().unwrap_or(0) as u32,
            duration_seconds: s["duration"]
                .as_str()
                .and_then(|v| v.parse::<f64>().ok())
                .unwrap_or(duration_seconds),
        });

        FFprobeValidationResult {
            valid: video.is_some(),
            format_name: format["format_name"].as_str().unwrap_or("").to_string(),
            duration_seconds,
            size_bytes,
            bitrate: format["bit_rate"]
                .as_str()
                .and_then(|v| v.parse::<u64>().ok())
                .unwrap_or(0),
            video,
            audio,
            error: None,
        }
    }
}
