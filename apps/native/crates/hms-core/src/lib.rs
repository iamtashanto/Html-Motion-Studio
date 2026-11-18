pub mod analyzer;
pub mod cdp_client;
pub mod database;
pub mod ffmpeg_pipeline;
pub mod headless_renderer;
pub mod models;
pub mod platform;
pub mod preview_injector;
pub mod project_manager;
pub mod templates;
pub mod zip_reader;

use crate::database::ProjectDatabase;
use crate::ffmpeg_pipeline::FFmpegPipeline;
use crate::headless_renderer::HeadlessRenderer;
use crate::models::{
    CompatibilityReport, DesktopExportJobConfig, DesktopExportProgress, DesktopSystemCapabilities,
    ExportHistoryRecord, ExportOutcome, FFprobeValidationResult, PreviewFrameRgba, ProjectData,
    RecentProjectItem, SampleTemplate,
};
use crate::project_manager::ProjectManager;
use anyhow::Result;
use std::path::{Path, PathBuf};
use std::sync::Arc;

/// Top-level native studio controller shared by the macOS SwiftUI FFI bridge
/// and the Windows/Linux Slint Rust UI.
pub struct StudioCore {
    pub db: ProjectDatabase,
    pub projects: ProjectManager,
    pub ffmpeg: Arc<FFmpegPipeline>,
    pub renderer: HeadlessRenderer,
    pub user_data_dir: PathBuf,
}

impl StudioCore {
    pub fn initialize(user_data_dir: Option<PathBuf>) -> Result<Self> {
        let dir = user_data_dir.unwrap_or_else(platform::default_user_data_dir);
        std::fs::create_dir_all(&dir)?;
        let db = ProjectDatabase::open(&dir)?;
        let projects = ProjectManager::new(&dir)?;
        let ffmpeg = Arc::new(FFmpegPipeline::new());
        let renderer = HeadlessRenderer::new(&dir, ffmpeg.clone())?;
        Ok(Self {
            db,
            projects,
            ffmpeg,
            renderer,
            user_data_dir: dir,
        })
    }

    pub fn get_system_capabilities(&self) -> DesktopSystemCapabilities {
        self.ffmpeg.get_system_capabilities()
    }

    pub fn get_templates(&self) -> Vec<SampleTemplate> {
        templates::sample_templates()
    }

    pub fn create_project(&self, title: Option<&str>, template_id: Option<&str>) -> ProjectData {
        templates::create_project_from_template(title, template_id)
    }

    pub fn open_project_from_path(&self, target_path: &Path) -> Result<ProjectData> {
        let project = self.projects.open_from_path(target_path)?;
        let mode_str = serde_json::to_value(&project.mode)
            .ok()
            .and_then(|v| v.as_str().map(String::from))
            .unwrap_or_else(|| "file".to_string());
        let _ = self.db.add_recent_project(&RecentProjectItem {
            id: project.id.clone(),
            title: project.title.clone(),
            file_path: target_path.to_string_lossy().to_string(),
            mode: mode_str,
            last_opened: chrono::Utc::now().timestamp_millis(),
            duration: project.detected_duration.unwrap_or(4.0),
        });
        Ok(project)
    }

    pub fn save_project_to_disk(
        &self,
        project: &ProjectData,
        target_path: Option<&Path>,
    ) -> Result<PathBuf> {
        let saved = self.projects.save_project_to_disk(project, target_path)?;
        let _ = self.db.add_recent_project(&RecentProjectItem {
            id: project.id.clone(),
            title: project.title.clone(),
            file_path: saved.to_string_lossy().to_string(),
            mode: "project".to_string(),
            last_opened: chrono::Utc::now().timestamp_millis(),
            duration: project.detected_duration.unwrap_or(4.0),
        });
        Ok(saved)
    }

    pub fn sync_render_html(&self, html_content: &str) -> Result<PathBuf> {
        self.projects.sync_render_html(html_content)
    }

    pub fn inject_preview_html(&self, raw_html: &str) -> String {
        preview_injector::inject_preview_controller(raw_html)
    }

    pub fn inspect_code(
        &self,
        html: &str,
        css: Option<&str>,
        js: Option<&str>,
        missing_assets: &[String],
    ) -> CompatibilityReport {
        analyzer::inspect_project_code(html, css, js, missing_assets)
    }

    pub fn get_recent_projects(&self, limit: usize) -> Result<Vec<RecentProjectItem>> {
        self.db.get_recent_projects(limit)
    }

    pub fn remove_recent_project(&self, id: &str) -> Result<()> {
        self.db.remove_recent_project(id)
    }

    pub fn clear_recent_projects(&self) -> Result<()> {
        self.db.clear_recent_projects()
    }

    pub fn get_audio_data_url(&self, path: &Path) -> Result<String> {
        self.projects.get_audio_data_url(path)
    }

    pub fn verify_video(&self, file_path: &Path) -> FFprobeValidationResult {
        self.ffmpeg.verify_video(file_path)
    }

    pub fn render_preview_frame(
        &self,
        raw_html: &str,
        width: u32,
        height: u32,
        time_seconds: f64,
    ) -> Result<PreviewFrameRgba> {
        self.renderer
            .render_preview_frame(raw_html, width, height, time_seconds)
    }

    pub fn start_export<F>(
        &self,
        config: &DesktopExportJobConfig,
        on_progress: F,
    ) -> Result<ExportOutcome>
    where
        F: FnMut(DesktopExportProgress),
    {
        let output_path = self.renderer.render_project(config, on_progress)?;
        let validation = self.ffmpeg.verify_video(&output_path);

        let _ = self.db.add_export_record(&ExportHistoryRecord {
            id: format!("exp-{}", chrono::Utc::now().timestamp_millis()),
            project_id: config.project.id.clone(),
            output_file_path: output_path.to_string_lossy().to_string(),
            format: config.settings.format.clone(),
            width: config.settings.width,
            height: config.settings.height,
            fps: config.settings.fps,
            duration_seconds: config.settings.duration_seconds,
            file_size_bytes: validation.size_bytes,
            created_at: chrono::Utc::now().timestamp_millis(),
        });

        Ok(ExportOutcome {
            output_file_path: output_path.to_string_lossy().to_string(),
            validation,
        })
    }

    pub fn cancel_export(&self) {
        self.renderer.cancel();
    }

    pub fn open_path(&self, path: &Path) -> Result<()> {
        platform::open_path_in_os(path)
    }

    pub fn show_item_in_folder(&self, path: &Path) -> Result<()> {
        platform::show_item_in_folder(path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{AudioSettings, ExportSettings};

    fn temp_test_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "hms_core_test_{name}_{}_{}",
            std::process::id(),
            chrono::Utc::now().timestamp_millis()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn templates_and_analyzer_parity() {
        let templates = templates::sample_templates();
        assert_eq!(templates.len(), 12);

        let report = analyzer::inspect_project_code(&templates[1].html, None, None, &[]);
        assert_eq!(report.overall_status, "ready");
        assert!(report.detected_features.has_css_animations);

        let webgl_report = analyzer::inspect_project_code(&templates[11].html, None, None, &[]);
        assert!(webgl_report.detected_features.has_webgl);
    }

    #[test]
    fn sqlite_recent_projects_and_history() {
        let dir = temp_test_dir("db");
        let core = StudioCore::initialize(Some(dir.clone())).unwrap();
        let proj = core.create_project(Some("Native Rust Demo"), Some("2-css-keyframes"));
        let saved = core.save_project_to_disk(&proj, None).unwrap();
        assert!(saved.is_file());

        let recents = core.get_recent_projects(10).unwrap();
        assert_eq!(recents.len(), 1);
        assert_eq!(recents[0].title, "Native Rust Demo");

        core.remove_recent_project(&recents[0].id).unwrap();
        assert!(core.get_recent_projects(10).unwrap().is_empty());
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn zip_path_traversal_is_rejected() {
        assert!(zip_reader::validate_safe_path("../etc/passwd").is_err());
        assert!(zip_reader::validate_safe_path("/absolute/path.html").is_err());
        assert!(zip_reader::validate_safe_path("a/b/c/d/e/f/g/h/i/too-deep.html").is_err());
        assert!(zip_reader::validate_safe_path("assets/logo.png").is_ok());
    }

    #[test]
    fn preview_injector_wraps_html_safely() {
        let html = "<!DOCTYPE html><html><head><title>T</title></head><body>Hi</body></html>";
        let injected = preview_injector::inject_preview_controller(html);
        assert!(injected.contains("__HMS_SEEK__"));
        assert_eq!(preview_injector::inject_preview_controller(&injected), injected);
    }

    #[test]
    fn end_to_end_native_render_when_chrome_and_ffmpeg_available() {
        let dir = temp_test_dir("e2e");
        let core = StudioCore::initialize(Some(dir.clone())).unwrap();
        let caps = core.get_system_capabilities();
        if !caps.ffmpeg_available || !caps.ffprobe_available || !caps.chromium_available {
            eprintln!("Skipping E2E native render test (missing ffmpeg/ffprobe/chromium)");
            let _ = std::fs::remove_dir_all(dir);
            return;
        }

        let proj = core.create_project(Some("E2E Native Export"), Some("2-css-keyframes"));
        let out_mp4 = dir.join("native-e2e-test.mp4");
        let config = DesktopExportJobConfig {
            job_id: "test-job-1".into(),
            project: proj,
            settings: ExportSettings {
                width: 640,
                height: 360,
                resolution: "720p".into(),
                fps: 24,
                format: "mp4".into(),
                duration_seconds: 1.0,
                ..ExportSettings::default()
            },
            audio_settings: AudioSettings::default(),
            audio_file_path: None,
            output_file_path: out_mp4.to_string_lossy().to_string(),
            strategy: "compatibility".into(),
        };

        let mut progress_count = 0usize;
        let outcome = core
            .start_export(&config, |_| {
                progress_count += 1;
            })
            .expect("Native CDP + FFmpeg streaming export failed");

        assert!(progress_count >= 24);
        assert!(outcome.validation.valid);
        let vid = outcome.validation.video.expect("Expected video stream");
        assert_eq!(vid.width, 640);
        assert_eq!(vid.height, 360);
        assert_eq!(vid.codec, "h264");
        let _ = std::fs::remove_dir_all(dir);
    }
}
