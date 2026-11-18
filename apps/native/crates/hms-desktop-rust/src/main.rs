mod dialogs;

use hms_core::models::{AudioSettings, DesktopExportJobConfig, ExportSettings, ProjectData};
use hms_core::platform::default_export_dir;
use hms_core::StudioCore;
use regex::Regex;
use slint::{Image, ModelRc, Rgba8Pixel, SharedPixelBuffer, SharedString, Timer, TimerMode, VecModel};
use std::path::{Path, PathBuf};
use std::rc::Rc;
use std::sync::{Arc, Mutex};
use std::time::Duration;

slint::include_modules!();

struct AppState {
    project: ProjectData,
    project_file_path: Option<PathBuf>,
    audio_file_path: Option<PathBuf>,
    output_dir: PathBuf,
    last_export_path: Option<PathBuf>,
    markers: Vec<f32>,
    preview_busy: bool,
}

fn slugify(input: &str) -> String {
    let s: String = input
        .to_ascii_lowercase()
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
        .collect();
    if s.is_empty() {
        "desktop-export".into()
    } else {
        s
    }
}

fn sync_project_to_ui(window: &StudioWindow, core: &StudioCore, project: &ProjectData) {
    window.set_project_title(SharedString::from(&project.title));
    window.set_entry_html_path(SharedString::from(&project.entry_html_path));

    let html_files: Vec<SharedString> = project
        .available_html_files
        .iter()
        .map(SharedString::from)
        .collect();
    window.set_available_html_files(ModelRc::new(VecModel::from(html_files)));

    let mut asset_rows: Vec<AssetRow> = project
        .assets
        .values()
        .map(|a| {
            let kind = if a.mime_type == "text/css" {
                "CSS"
            } else if a.mime_type.contains("javascript") {
                "JS"
            } else if a.mime_type.starts_with("image/") {
                "IMG"
            } else if a.mime_type.starts_with("text/html") {
                "HTML"
            } else {
                "FILE"
            };
            AssetRow {
                name: SharedString::from(&a.name),
                path: SharedString::from(&a.path),
                kind: SharedString::from(kind),
                size_label: SharedString::from(format!("{:.1}k", a.size as f64 / 1024.0)),
            }
        })
        .collect();
    asset_rows.sort_by(|a, b| a.name.cmp(&b.name));
    window.set_asset_rows(ModelRc::new(VecModel::from(asset_rows)));

    let report = core.inspect_code(
        &project.html_content,
        project.css_content.as_deref(),
        project.js_content.as_deref(),
        &project.missing_assets,
    );
    window.set_compatibility_status(SharedString::from(report.overall_status));
    window.set_compatibility_summary(SharedString::from(report.summary));
}

fn sync_recents_to_ui(window: &StudioWindow, core: &StudioCore) {
    if let Ok(recents) = core.get_recent_projects(12) {
        let rows: Vec<RecentRow> = recents
            .into_iter()
            .map(|r| RecentRow {
                id: SharedString::from(r.id),
                title: SharedString::from(r.title),
                file_path: SharedString::from(r.file_path),
            })
            .collect();
        window.set_recent_projects(ModelRc::new(VecModel::from(rows)));
    }
}

fn sync_markers_to_ui(window: &StudioWindow, markers: &[f32], duration: f32) {
    let dur = duration.max(0.1);
    let rows: Vec<MarkerRow> = markers
        .iter()
        .map(|&t| MarkerRow {
            time: t,
            pct: (t / dur).clamp(0.0, 1.0),
        })
        .collect();
    window.set_markers(ModelRc::new(VecModel::from(rows)));
}

fn request_preview_frame(
    weak_window: slint::Weak<StudioWindow>,
    core: Arc<StudioCore>,
    state: Arc<Mutex<AppState>>,
    time_seconds: f64,
) {
    let (html, already_busy) = {
        let mut st = state.lock().unwrap();
        if st.preview_busy {
            (String::new(), true)
        } else {
            st.preview_busy = true;
            (st.project.html_content.clone(), false)
        }
    };
    if already_busy {
        return;
    }

    std::thread::spawn(move || {
        let rendered = core.render_preview_frame(&html, 960, 540, time_seconds);
        if let Ok(mut st) = state.lock() {
            st.preview_busy = false;
        }
        if let Ok(frame) = rendered {
            let _ = slint::invoke_from_event_loop(move || {
                if let Some(win) = weak_window.upgrade() {
                    let mut pixel_buf =
                        SharedPixelBuffer::<Rgba8Pixel>::new(frame.width, frame.height);
                    let dest = pixel_buf.make_mut_bytes();
                    if dest.len() == frame.rgba.len() {
                        dest.copy_from_slice(&frame.rgba);
                        win.set_preview_image(Image::from_rgba8(pixel_buf));
                        win.set_preview_ready(true);
                    }
                }
            });
        }
    });
}

fn main() -> anyhow::Result<()> {
    let core = Arc::new(StudioCore::initialize(None)?);
    let initial_project = core.create_project(None, Some("2-css-keyframes"));
    let default_dir = default_export_dir();

    let state = Arc::new(Mutex::new(AppState {
        project: initial_project.clone(),
        project_file_path: None,
        audio_file_path: None,
        output_dir: default_dir.clone(),
        last_export_path: None,
        markers: vec![1.0, 2.5],
        preview_busy: false,
    }));

    let window = StudioWindow::new()?;

    // Populate system capabilities
    let caps = core.get_system_capabilities();
    window.set_ffmpeg_available(caps.ffmpeg_available);
    window.set_chromium_available(caps.chromium_available);
    let cap_text = format!(
        "FFmpeg {} • Chromium {}",
        if caps.ffmpeg_available { "Active" } else { "Missing" },
        if caps.chromium_available { "Ready" } else { "Missing" }
    );
    window.set_capabilities_label(SharedString::from(cap_text));

    // Populate 12 templates
    let tmpl_rows: Vec<TemplateRow> = core
        .get_templates()
        .into_iter()
        .map(|t| TemplateRow {
            id: SharedString::from(t.id),
            name: SharedString::from(t.name),
            category: SharedString::from(t.category),
            description: SharedString::from(t.description),
            duration: t.default_duration as f32,
        })
        .collect();
    window.set_templates(ModelRc::new(VecModel::from(tmpl_rows)));
    window.set_output_directory(SharedString::from(default_dir.to_string_lossy().as_ref()));
    window.set_output_filename(SharedString::from(slugify(&initial_project.title)));
    window.set_duration_seconds(initial_project.detected_duration.unwrap_or(4.0) as f32);

    sync_project_to_ui(&window, &core, &initial_project);
    sync_recents_to_ui(&window, &core);
    sync_markers_to_ui(&window, &[1.0, 2.5], 4.0);

    // Initial preview render
    request_preview_frame(window.as_weak(), core.clone(), state.clone(), 0.0);

    // Create project callback
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_create_project(move |title, template_id| {
            let proj = core.create_project(Some(title.as_str()), Some(template_id.as_str()));
            let dur = proj.detected_duration.unwrap_or(4.0) as f32;
            {
                let mut st = state.lock().unwrap();
                st.project = proj.clone();
                st.project_file_path = None;
            }
            if let Some(win) = weak.upgrade() {
                win.set_is_dirty(false);
                win.set_is_playing(false);
                win.set_current_time(0.0);
                win.set_duration_seconds(dur);
                win.set_output_filename(SharedString::from(slugify(&proj.title)));
                sync_project_to_ui(&win, &core, &proj);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), 0.0);
            }
        });
    }

    // Open project file / ZIP / .hmsproj
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_open_project_file(move || {
            if let Some(path) = dialogs::open_project_file_dialog() {
                open_project_into_ui(&weak, &core, &state, &path);
            }
        });
    }

    // Open project folder
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_open_project_folder(move || {
            if let Some(path) = dialogs::open_project_folder_dialog() {
                open_project_into_ui(&weak, &core, &state, &path);
            }
        });
    }

    // Open recent project
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_open_recent_project(move |path_str| {
            open_project_into_ui(&weak, &core, &state, Path::new(path_str.as_str()));
        });
    }

    // Save project
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_save_project(move || {
            let (proj, existing) = {
                let st = state.lock().unwrap();
                (st.project.clone(), st.project_file_path.clone())
            };
            match core.save_project_to_disk(&proj, existing.as_deref()) {
                Ok(saved) => {
                    state.lock().unwrap().project_file_path = Some(saved);
                    if let Some(win) = weak.upgrade() {
                        win.set_is_dirty(false);
                        sync_recents_to_ui(&win, &core);
                    }
                }
                Err(e) => {
                    if let Some(win) = weak.upgrade() {
                        win.set_error_banner(SharedString::from(format!("Save failed: {e}")));
                    }
                }
            }
        });
    }

    // Rename project
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_rename_project(move |new_title| {
            let trimmed = new_title.trim().to_string();
            if trimmed.is_empty() {
                return;
            }
            state.lock().unwrap().project.title = trimmed.clone();
            if let Some(win) = weak.upgrade() {
                win.set_output_filename(SharedString::from(slugify(&trimmed)));
                win.set_is_dirty(true);
            }
        });
    }

    // Select entry HTML
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_select_entry_html(move |entry_path| {
            let updated = {
                let mut st = state.lock().unwrap();
                if let Some(asset) = st.project.assets.get(entry_path.as_str()).cloned() {
                    if let Some(content) = asset.content {
                        st.project.entry_html_path = entry_path.to_string();
                        st.project.html_content = content;
                        Some(st.project.clone())
                    } else {
                        None
                    }
                } else {
                    None
                }
            };
            if let (Some(proj), Some(win)) = (updated, weak.upgrade()) {
                win.set_is_dirty(true);
                sync_project_to_ui(&win, &core, &proj);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), 0.0);
            }
        });
    }

    // Audio attach / clear
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_select_audio_file(move || {
            if let Some(path) = dialogs::open_audio_file_dialog() {
                let fname = path
                    .file_name()
                    .and_then(|s| s.to_str())
                    .unwrap_or("soundtrack")
                    .to_string();
                state.lock().unwrap().audio_file_path = Some(path.clone());
                if let Some(win) = weak.upgrade() {
                    win.set_audio_file_name(SharedString::from(fname));
                    win.set_audio_file_path(SharedString::from(path.to_string_lossy().as_ref()));
                    win.set_is_dirty(true);
                }
            }
        });
    }
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_clear_audio(move || {
            state.lock().unwrap().audio_file_path = None;
            if let Some(win) = weak.upgrade() {
                win.set_audio_file_name(SharedString::from(""));
                win.set_audio_file_path(SharedString::from(""));
                win.set_is_dirty(true);
            }
        });
    }

    // Playback & scrubbing
    {
        let weak = window.as_weak();
        window.on_toggle_play(move || {
            if let Some(win) = weak.upgrade() {
                win.set_is_playing(!win.get_is_playing());
            }
        });
    }
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_stop_and_rewind(move || {
            if let Some(win) = weak.upgrade() {
                win.set_is_playing(false);
                win.set_current_time(0.0);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), 0.0);
            }
        });
    }
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_restart_playback(move || {
            if let Some(win) = weak.upgrade() {
                win.set_current_time(0.0);
                win.set_is_playing(true);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), 0.0);
            }
        });
    }
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_seek_to(move |target| {
            if let Some(win) = weak.upgrade() {
                let dur = win.get_duration_seconds().max(0.1);
                let clamped = target.clamp(0.0, dur);
                win.set_current_time(clamped);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), clamped as f64);
            }
        });
    }
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_step_frame(move |forward| {
            if let Some(win) = weak.upgrade() {
                let fps = win.get_fps().max(1) as f32;
                let dur = win.get_duration_seconds().max(0.1);
                let dt = 1.0 / fps;
                let next = if forward {
                    (win.get_current_time() + dt).min(dur)
                } else {
                    (win.get_current_time() - dt).max(0.0)
                };
                win.set_is_playing(false);
                win.set_current_time(next);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), next as f64);
            }
        });
    }
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_add_marker(move || {
            if let Some(win) = weak.upgrade() {
                let t = (win.get_current_time() * 100.0).round() / 100.0;
                let dur = win.get_duration_seconds();
                let mut st = state.lock().unwrap();
                if !st.markers.iter().any(|&m| (m - t).abs() < 0.02) {
                    st.markers.push(t);
                    st.markers.sort_by(|a, b| a.partial_cmp(b).unwrap());
                }
                sync_markers_to_ui(&win, &st.markers, dur);
            }
        });
    }
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_refresh_preview(move || {
            if let Some(win) = weak.upgrade() {
                request_preview_frame(
                    weak.clone(),
                    core.clone(),
                    state.clone(),
                    win.get_current_time() as f64,
                );
            }
        });
    }
    {
        let core = core.clone();
        let state = state.clone();
        window.on_open_browser_preview(move || {
            let html = state.lock().unwrap().project.html_content.clone();
            if let Ok(path) = core.sync_render_html(&html) {
                let _ = core.open_path(&path);
            }
        });
    }

    // Inspector Settings callbacks
    {
        let weak = window.as_weak();
        window.on_set_resolution(move |preset, w, h| {
            if let Some(win) = weak.upgrade() {
                win.set_resolution_preset(preset);
                win.set_width_px(w);
                win.set_height_px(h);
            }
        });
    }
    {
        let weak = window.as_weak();
        window.on_set_fps(move |fps| {
            if let Some(win) = weak.upgrade() {
                win.set_fps(fps);
            }
        });
    }
    {
        let weak = window.as_weak();
        window.on_set_format(move |fmt| {
            if let Some(win) = weak.upgrade() {
                win.set_format(fmt);
            }
        });
    }
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_set_duration(move |dur| {
            if let Some(win) = weak.upgrade() {
                win.set_duration_seconds(dur);
                let markers = state.lock().unwrap().markers.clone();
                sync_markers_to_ui(&win, &markers, dur);
            }
        });
    }
    {
        let weak = window.as_weak();
        window.on_set_strategy(move |s| {
            if let Some(win) = weak.upgrade() {
                win.set_strategy(s);
            }
        });
    }
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_choose_save_destination(move || {
            if let Some(win) = weak.upgrade() {
                let default_name = win.get_output_filename().to_string();
                let fmt = win.get_format().to_string();
                if let Some(path) = dialogs::save_video_file_dialog(&default_name, &fmt) {
                    if let Some(parent) = path.parent() {
                        state.lock().unwrap().output_dir = parent.to_path_buf();
                        win.set_output_directory(SharedString::from(
                            parent.to_string_lossy().as_ref(),
                        ));
                    }
                    if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                        win.set_output_filename(SharedString::from(stem));
                    }
                }
            }
        });
    }

    // Code Editor callbacks
    {
        let weak = window.as_weak();
        let state = state.clone();
        window.on_open_code_editor_requested(move || {
            let html = state.lock().unwrap().project.html_content.clone();
            let style_re = Regex::new(r"(?is)<style[^>]*>([\s\S]*?)</style>").unwrap();
            let css = style_re
                .captures(&html)
                .and_then(|c| c.get(1))
                .map(|m| m.as_str().trim().to_string())
                .unwrap_or_else(|| "/* Embedded CSS styles */\nbody {\n  margin: 0;\n}".into());

            let script_re = Regex::new(r"(?is)<script[^>]*>([\s\S]*?)</script>").unwrap();
            let js = script_re
                .captures(&html)
                .and_then(|c| c.get(1))
                .map(|m| m.as_str().trim().to_string())
                .unwrap_or_else(|| "// Custom animation script".into());

            if let Some(win) = weak.upgrade() {
                win.set_editor_html(SharedString::from(html));
                win.set_editor_css(SharedString::from(css));
                win.set_editor_js(SharedString::from(js));
                win.set_show_code_editor(true);
            }
        });
    }
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_apply_code_editor(move || {
            if let Some(win) = weak.upgrade() {
                let mut final_html = win.get_editor_html().to_string();
                let tab = win.get_code_tab();
                if tab == 1 {
                    let css = win.get_editor_css().to_string();
                    let style_re = Regex::new(r"(?is)<style[^>]*>[\s\S]*?</style>").unwrap();
                    if style_re.is_match(&final_html) {
                        final_html = style_re
                            .replace(&final_html, format!("<style>\n{css}\n</style>"))
                            .into_owned();
                    } else if final_html.contains("</head>") {
                        final_html =
                            final_html.replace("</head>", &format!("<style>\n{css}\n</style>\n</head>"));
                    } else {
                        final_html = format!("<style>\n{css}\n</style>\n{final_html}");
                    }
                } else if tab == 2 {
                    let js = win.get_editor_js().to_string();
                    let script_re = Regex::new(r"(?is)<script[^>]*>[\s\S]*?</script>").unwrap();
                    if script_re.is_match(&final_html) {
                        final_html = script_re
                            .replace(&final_html, format!("<script>\n{js}\n</script>"))
                            .into_owned();
                    } else if final_html.contains("</body>") {
                        final_html =
                            final_html.replace("</body>", &format!("<script>\n{js}\n</script>\n</body>"));
                    } else {
                        final_html = format!("{final_html}\n<script>\n{js}\n</script>");
                    }
                }

                let proj = {
                    let mut st = state.lock().unwrap();
                    st.project.html_content = final_html.clone();
                    st.project.render_html_path = core
                        .sync_render_html(&final_html)
                        .ok()
                        .map(|p| p.to_string_lossy().to_string());
                    st.project.clone()
                };
                win.set_editor_html(SharedString::from(final_html));
                win.set_is_dirty(true);
                sync_project_to_ui(&win, &core, &proj);
                request_preview_frame(
                    weak.clone(),
                    core.clone(),
                    state.clone(),
                    win.get_current_time() as f64,
                );
            }
        });
    }
    {
        let weak = window.as_weak();
        window.on_format_code_editor(move || {
            if let Some(win) = weak.upgrade() {
                if win.get_code_tab() == 0 {
                    let raw = win.get_editor_html().to_string();
                    let mut out = String::new();
                    let mut indent: usize = 0;
                    for line in raw.lines() {
                        let trimmed = line.trim();
                        if trimmed.starts_with("</") {
                            indent = indent.saturating_sub(1);
                        }
                        out.push_str(&"  ".repeat(indent));
                        out.push_str(trimmed);
                        out.push('\n');
                        if trimmed.starts_with('<')
                            && !trimmed.starts_with("</")
                            && !trimmed.starts_with("<!")
                            && !trimmed.ends_with("/>")
                            && !trimmed.contains("</")
                        {
                            indent += 1;
                        }
                    }
                    win.set_editor_html(SharedString::from(out.trim()));
                }
            }
        });
    }

    // Export Start / Cancel / Open / Reveal
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        window.on_start_export(move || {
            let Some(win) = weak.upgrade() else { return };
            let (mut project, audio_path, out_dir) = {
                let st = state.lock().unwrap();
                (
                    st.project.clone(),
                    st.audio_file_path.clone(),
                    st.output_dir.clone(),
                )
            };

            if let Ok(synced) = core.sync_render_html(&project.html_content) {
                project.render_html_path = Some(synced.to_string_lossy().to_string());
            }

            let format = win.get_format().to_string();
            let filename = win.get_output_filename().to_string();
            let clean_name = if filename.trim().is_empty() {
                "desktop-export".to_string()
            } else {
                filename.trim().to_string()
            };
            let output_file = out_dir.join(format!("{clean_name}.{format}"));

            let settings = ExportSettings {
                width: win.get_width_px().max(240) as u32,
                height: win.get_height_px().max(240) as u32,
                resolution: win.get_resolution_preset().to_string(),
                fps: win.get_fps().max(1) as u32,
                format: format.clone(),
                duration_seconds: win.get_duration_seconds() as f64,
                filename: clean_name,
                ..ExportSettings::default()
            };
            let audio_settings = AudioSettings {
                source_mode: if audio_path.is_some() {
                    "external".into()
                } else {
                    "none".into()
                },
                file_name: audio_path
                    .as_ref()
                    .and_then(|p| p.file_name())
                    .and_then(|s| s.to_str())
                    .map(String::from),
                volume: win.get_audio_volume() as f64,
                fade_in_seconds: win.get_audio_fade_in() as f64,
                fade_out_seconds: win.get_audio_fade_out() as f64,
                start_offset_seconds: win.get_audio_offset() as f64,
                ..AudioSettings::default()
            };

            let config = DesktopExportJobConfig {
                job_id: format!("job-{}", chrono::Utc::now().timestamp_millis()),
                project,
                settings,
                audio_settings,
                audio_file_path: audio_path.map(|p| p.to_string_lossy().to_string()),
                output_file_path: output_file.to_string_lossy().to_string(),
                strategy: win.get_strategy().to_string(),
            };

            win.set_is_exporting(true);
            win.set_error_banner(SharedString::from(""));
            win.set_export_pct(0);
            win.set_export_message(SharedString::from("Initializing native Rust pipeline..."));

            let weak_thread = weak.clone();
            let core_thread = core.clone();
            let state_thread = state.clone();

            std::thread::spawn(move || {
                let res = core_thread.start_export(&config, |prog| {
                    let w = weak_thread.clone();
                    let _ = slint::invoke_from_event_loop(move || {
                        if let Some(win) = w.upgrade() {
                            win.set_export_pct(prog.percentage as i32);
                            win.set_export_current_frame(prog.current_frame as i32);
                            win.set_export_total_frames(prog.total_frames as i32);
                            win.set_export_elapsed_label(SharedString::from(format!(
                                "{:.1}s",
                                prog.elapsed_ms as f64 / 1000.0
                            )));
                            win.set_export_fps_label(SharedString::from(format!(
                                "{:.1} FPS",
                                prog.current_fps
                            )));
                            win.set_export_message(SharedString::from(prog.message));
                        }
                    });
                });

                let _ = slint::invoke_from_event_loop(move || {
                    if let Some(win) = weak_thread.upgrade() {
                        win.set_is_exporting(false);
                        match res {
                            Ok(outcome) => {
                                state_thread.lock().unwrap().last_export_path =
                                    Some(PathBuf::from(&outcome.output_file_path));
                                let fname = Path::new(&outcome.output_file_path)
                                    .file_name()
                                    .and_then(|s| s.to_str())
                                    .unwrap_or("video.mp4")
                                    .to_string();
                                win.set_success_filename(SharedString::from(fname));
                                if let Some(v) = outcome.validation.video {
                                    win.set_success_codec(SharedString::from(
                                        v.codec.to_ascii_uppercase(),
                                    ));
                                    win.set_success_dimensions(SharedString::from(format!(
                                        "{}×{}",
                                        v.width, v.height
                                    )));
                                    win.set_success_fps(SharedString::from(format!(
                                        "{} fps",
                                        v.fps
                                    )));
                                }
                                win.set_success_size(SharedString::from(format!(
                                    "{:.2} MB",
                                    outcome.validation.size_bytes as f64 / (1024.0 * 1024.0)
                                )));
                                win.set_show_success_modal(true);
                            }
                            Err(err) => {
                                win.set_error_banner(SharedString::from(err.to_string()));
                            }
                        }
                    }
                });
            });
        });
    }
    {
        let core = core.clone();
        window.on_cancel_export(move || {
            core.cancel_export();
        });
    }
    {
        let core = core.clone();
        let state = state.clone();
        window.on_open_exported_video(move || {
            if let Some(p) = state.lock().unwrap().last_export_path.clone() {
                let _ = core.open_path(&p);
            }
        });
    }
    {
        let core = core.clone();
        let state = state.clone();
        window.on_show_exported_in_folder(move || {
            if let Some(p) = state.lock().unwrap().last_export_path.clone() {
                let _ = core.show_item_in_folder(&p);
            }
        });
    }

    // Playback Timer (12 FPS preview stepping on background CDP session)
    let playback_timer = Rc::new(Timer::default());
    {
        let weak = window.as_weak();
        let core = core.clone();
        let state = state.clone();
        playback_timer.start(TimerMode::Repeated, Duration::from_millis(83), move || {
            if let Some(win) = weak.upgrade() {
                if win.get_is_playing() && !win.get_is_exporting() {
                    let dur = win.get_duration_seconds().max(0.1);
                    let mut next = win.get_current_time() + 0.083;
                    if next >= dur {
                        next = 0.0;
                    }
                    win.set_current_time(next);
                    request_preview_frame(weak.clone(), core.clone(), state.clone(), next as f64);
                }
            }
        });
    }

    window.run()?;
    drop(playback_timer);
    Ok(())
}

fn open_project_into_ui(
    weak: &slint::Weak<StudioWindow>,
    core: &Arc<StudioCore>,
    state: &Arc<Mutex<AppState>>,
    path: &Path,
) {
    match core.open_project_from_path(path) {
        Ok(proj) => {
            let dur = proj.detected_duration.unwrap_or(4.0) as f32;
            {
                let mut st = state.lock().unwrap();
                st.project = proj.clone();
                st.project_file_path = Some(path.to_path_buf());
            }
            if let Some(win) = weak.upgrade() {
                win.set_is_dirty(false);
                win.set_is_playing(false);
                win.set_current_time(0.0);
                win.set_duration_seconds(dur);
                win.set_output_filename(SharedString::from(slugify(&proj.title)));
                win.set_error_banner(SharedString::from(""));
                sync_project_to_ui(&win, core, &proj);
                sync_recents_to_ui(&win, core);
                request_preview_frame(weak.clone(), core.clone(), state.clone(), 0.0);
            }
        }
        Err(e) => {
            if let Some(win) = weak.upgrade() {
                win.set_error_banner(SharedString::from(format!("Failed to open project: {e}")));
            }
        }
    }
}
