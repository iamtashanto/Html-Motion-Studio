use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum UploadMode {
    File,
    Zip,
    Folder,
    Project,
    Code,
}

impl Default for UploadMode {
    fn default() -> Self {
        Self::Code
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectAsset {
    pub path: String,
    pub name: String,
    #[serde(rename = "type")]
    pub mime_type: String,
    pub size: u64,
    pub blob_url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectData {
    pub id: String,
    pub title: String,
    pub mode: UploadMode,
    pub html_content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub render_html_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub css_content: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub js_content: Option<String>,
    pub entry_html_path: String,
    pub available_html_files: Vec<String>,
    pub assets: HashMap<String, ProjectAsset>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detected_duration: Option<f64>,
    pub missing_assets: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SampleTemplate {
    pub id: String,
    pub name: String,
    pub category: String,
    pub description: String,
    pub default_duration: f64,
    pub html: String,
    pub expected_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentProjectItem {
    pub id: String,
    pub title: String,
    pub file_path: String,
    pub mode: String,
    pub last_opened: i64,
    pub duration: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportHistoryRecord {
    pub id: String,
    pub project_id: String,
    pub output_file_path: String,
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub duration_seconds: f64,
    pub file_size_bytes: u64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopSystemCapabilities {
    pub os: String,
    pub arch: String,
    pub ffmpeg_available: bool,
    pub ffmpeg_path: String,
    pub ffmpeg_version: String,
    pub ffprobe_available: bool,
    pub ffprobe_path: String,
    pub ffprobe_version: String,
    pub chromium_available: bool,
    pub chromium_path: String,
    pub gpu_acceleration: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportSettings {
    pub aspect_ratio: String,
    pub width: u32,
    pub height: u32,
    pub resolution: String,
    pub fps: u32,
    pub format: String, // "mp4" | "webm" | "mov"
    pub quality: String, // "draft" | "standard" | "high" | "ultra"
    pub video_bitrate_mbps: u32,
    pub audio_bitrate_kbps: u32,
    pub duration_policy: String,
    pub duration_seconds: f64,
    pub loop_animation_if_shorter: bool,
    pub filename: String,
    pub engine_strategy: String,
}

impl Default for ExportSettings {
    fn default() -> Self {
        Self {
            aspect_ratio: "16:9".to_string(),
            width: 1920,
            height: 1080,
            resolution: "1080p".to_string(),
            fps: 60,
            format: "mp4".to_string(),
            quality: "high".to_string(),
            video_bitrate_mbps: 16,
            audio_bitrate_kbps: 256,
            duration_policy: "project".to_string(),
            duration_seconds: 4.0,
            loop_animation_if_shorter: true,
            filename: "desktop-export".to_string(),
            engine_strategy: "auto".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioSettings {
    pub source_mode: String, // "none" | "external" | "html" | "both"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    pub duration_seconds: f64,
    pub volume: f64,
    pub start_offset_seconds: f64,
    pub trim_in_seconds: f64,
    pub trim_out_seconds: f64,
    pub fade_in_seconds: f64,
    pub fade_out_seconds: f64,
}

impl Default for AudioSettings {
    fn default() -> Self {
        Self {
            source_mode: "none".to_string(),
            file_name: None,
            duration_seconds: 0.0,
            volume: 1.0,
            start_offset_seconds: 0.0,
            trim_in_seconds: 0.0,
            trim_out_seconds: 0.0,
            fade_in_seconds: 0.5,
            fade_out_seconds: 0.5,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopExportJobConfig {
    pub job_id: String,
    pub project: ProjectData,
    pub settings: ExportSettings,
    pub audio_settings: AudioSettings,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub audio_file_path: Option<String>,
    pub output_file_path: String,
    pub strategy: String, // "adapter" | "compatibility"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopExportProgress {
    pub job_id: String,
    pub status: String, // "validating" | "rendering" | "encoding" | "muxing" | "completed" | "cancelled" | "error"
    pub current_frame: u32,
    pub total_frames: u32,
    pub percentage: u32,
    pub elapsed_ms: u64,
    pub estimated_remaining_ms: u64,
    pub current_fps: f64,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoStreamInfo {
    pub codec: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frame_count: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pixel_format: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioStreamInfo {
    pub codec: String,
    pub sample_rate: u32,
    pub channels: u32,
    pub duration_seconds: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FFprobeValidationResult {
    pub valid: bool,
    pub format_name: String,
    pub duration_seconds: f64,
    pub size_bytes: u64,
    pub bitrate: u64,
    pub video: Option<VideoStreamInfo>,
    pub audio: Option<AudioStreamInfo>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompatibilityCheckItem {
    pub id: String,
    pub name: String,
    pub detected: bool,
    pub status: String, // "ok" | "warning" | "error" | "info"
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetectedFeatures {
    pub has_html: bool,
    pub has_css_animations: bool,
    pub has_css_transitions: bool,
    pub has_raf: bool,
    pub has_canvas: bool,
    pub has_svg: bool,
    pub has_webgl: bool,
    pub has_audio: bool,
    pub external_urls: Vec<String>,
    pub missing_assets: Vec<String>,
    pub cors_risks: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detected_duration: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompatibilityReport {
    pub overall_status: String, // "ready" | "limited" | "desktop-recommended" | "unsupported"
    pub summary: String,
    pub checks: Vec<CompatibilityCheckItem>,
    pub detected_features: DetectedFeatures,
    pub recommended_strategy: String,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportOutcome {
    pub output_file_path: String,
    pub validation: FFprobeValidationResult,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviewFrameRgba {
    pub width: u32,
    pub height: u32,
    pub rgba: Vec<u8>,
}
