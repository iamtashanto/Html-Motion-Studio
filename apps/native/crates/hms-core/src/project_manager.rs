use crate::models::{ProjectAsset, ProjectData, UploadMode};
use crate::zip_reader::{
    extract_zip_bytes, MAX_DEPTH, MAX_FILE_COUNT, MAX_SINGLE_FILE_SIZE, MAX_TOTAL_EXTRACTED_SIZE,
};
use anyhow::{bail, Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use regex::Regex;
use std::collections::{BTreeSet, HashMap};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use walkdir::WalkDir;

pub struct ProjectManager {
    temp_workspaces_dir: PathBuf,
    active_project_paths: Mutex<HashMap<String, PathBuf>>,
    latest_active_render_path: Mutex<Option<PathBuf>>,
}

impl ProjectManager {
    pub fn new(user_data_path: &Path) -> Result<Self> {
        let temp_workspaces_dir = user_data_path.join("workspaces");
        fs::create_dir_all(&temp_workspaces_dir)?;
        Ok(Self {
            temp_workspaces_dir,
            active_project_paths: Mutex::new(HashMap::new()),
            latest_active_render_path: Mutex::new(None),
        })
    }

    pub fn get_render_html_path(&self, project_id: &str) -> Option<PathBuf> {
        if let Ok(map) = self.active_project_paths.lock() {
            if let Some(p) = map.get(project_id) {
                return Some(p.clone());
            }
        }
        self.latest_active_render_path
            .lock()
            .ok()
            .and_then(|g| g.clone())
    }

    pub fn get_audio_data_url(&self, file_path: &Path) -> Result<String> {
        if !file_path.exists() {
            bail!("Audio file not found at path: {}", file_path.display());
        }
        let mime = detect_mime_type(file_path);
        let bytes = fs::read(file_path)?;
        Ok(format!("data:{};base64,{}", mime, STANDARD.encode(bytes)))
    }

    pub fn open_from_path(&self, target_path: &Path) -> Result<ProjectData> {
        if !target_path.exists() {
            bail!("Target file or folder not found: {}", target_path.display());
        }
        if target_path.is_dir() {
            return self.open_folder_project(target_path);
        }
        let ext = target_path
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();

        match ext.as_str() {
            "zip" => self.open_zip_archive(target_path),
            "html" | "htm" => self.open_single_html_file(target_path),
            "hmsproj" | "json" => self.open_saved_project_file(target_path),
            _ => bail!(
                "Unsupported project format: .{ext}. Please select an HTML file, ZIP package, .hmsproj, or project folder."
            ),
        }
    }

    pub fn open_single_html_file(&self, file_path: &Path) -> Result<ProjectData> {
        let raw_content = fs::read_to_string(file_path)
            .with_context(|| format!("Failed to read HTML file {}", file_path.display()))?;
        let file_name = file_path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("index.html")
            .to_string();
        let title = file_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Untitled")
            .to_string();
        let dir = file_path.parent().unwrap_or_else(|| Path::new("."));

        let mut assets = HashMap::new();
        let mut missing_assets = Vec::new();
        let mut referenced_paths = BTreeSet::new();

        let rel_re = Regex::new(
            r#"(?i)(?:src|href)=["']([^"':#?]+)["']|url\(\s*["']?([^"'():#?]+)["']?\s*\)"#,
        )
        .unwrap();

        for caps in rel_re.captures_iter(&raw_content) {
            let ref_str = caps
                .get(1)
                .or_else(|| caps.get(2))
                .map(|m| m.as_str().trim())
                .unwrap_or("");
            if ref_str.is_empty()
                || ref_str.starts_with("http:")
                || ref_str.starts_with("https:")
                || ref_str.starts_with("//")
                || ref_str.starts_with("data:")
                || ref_str.starts_with("blob:")
                || ref_str.starts_with('#')
            {
                continue;
            }
            referenced_paths.insert(ref_str.to_string());
        }

        for ref_path in referenced_paths {
            let item_path = dir.join(&ref_path);
            if item_path.is_file() {
                if let Ok(meta) = fs::metadata(&item_path) {
                    if meta.len() <= MAX_SINGLE_FILE_SIZE {
                        if let Ok(bytes) = fs::read(&item_path) {
                            let mime = detect_mime_type(&item_path);
                            let data_uri = format!("data:{};base64,{}", mime, STANDARD.encode(&bytes));
                            let content = if is_text_mime(&mime) {
                                String::from_utf8(bytes).ok()
                            } else {
                                None
                            };
                            let name = Path::new(&ref_path)
                                .file_name()
                                .and_then(|s| s.to_str())
                                .unwrap_or(&ref_path)
                                .to_string();
                            assets.insert(
                                ref_path.clone(),
                                ProjectAsset {
                                    path: ref_path,
                                    name,
                                    mime_type: mime,
                                    size: meta.len(),
                                    blob_url: data_uri,
                                    content,
                                },
                            );
                        }
                    }
                }
            } else {
                missing_assets.push(ref_path);
            }
        }

        let rewritten_html = if assets.is_empty() {
            raw_content.clone()
        } else {
            rewrite_asset_references(&raw_content, &assets)
        };

        let now_ms = chrono::Utc::now().timestamp_millis();
        let active_render_path = self
            .temp_workspaces_dir
            .join(format!("active_{now_ms}_single.html"));
        let _ = fs::write(&active_render_path, &rewritten_html);

        let id = format!("file-{now_ms}");
        self.record_active_path(&id, &active_render_path);

        let detected_duration = detect_duration_from_html(&raw_content).unwrap_or(4.0);

        Ok(ProjectData {
            id,
            title,
            mode: UploadMode::File,
            html_content: rewritten_html,
            render_html_path: Some(active_render_path.to_string_lossy().to_string()),
            css_content: None,
            js_content: None,
            entry_html_path: file_name.clone(),
            available_html_files: vec![file_name],
            assets,
            detected_duration: Some(detected_duration),
            missing_assets,
        })
    }

    pub fn open_zip_archive(&self, zip_path: &Path) -> Result<ProjectData> {
        let zip_bytes = fs::read(zip_path)
            .with_context(|| format!("Failed to read ZIP archive {}", zip_path.display()))?;
        let entries = extract_zip_bytes(&zip_bytes)?;

        let mut assets = HashMap::new();
        let mut html_files = Vec::new();

        for entry in entries {
            let mime = detect_mime_type(Path::new(&entry.path));
            let lower = entry.path.to_ascii_lowercase();
            if lower.ends_with(".html") || lower.ends_with(".htm") {
                html_files.push(entry.path.clone());
            }
            let size = entry.data.len() as u64;
            let data_uri = format!("data:{};base64,{}", mime, STANDARD.encode(&entry.data));
            let content = if is_text_mime(&mime) {
                String::from_utf8(entry.data).ok()
            } else {
                None
            };
            let name = Path::new(&entry.path)
                .file_name()
                .and_then(|s| s.to_str())
                .unwrap_or(&entry.path)
                .to_string();

            assets.insert(
                entry.path.clone(),
                ProjectAsset {
                    path: entry.path,
                    name,
                    mime_type: mime,
                    size,
                    blob_url: data_uri,
                    content,
                },
            );
        }

        if html_files.is_empty() {
            bail!("No valid HTML entry file (.html / .htm) found inside ZIP archive.");
        }

        let default_entry = pick_default_entry(&html_files);
        let raw_html = assets
            .get(&default_entry)
            .and_then(|a| a.content.clone())
            .unwrap_or_default();
        let rewritten_html = rewrite_asset_references(&raw_html, &assets);
        let title = zip_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("ZIP Project")
            .to_string();

        let now_ms = chrono::Utc::now().timestamp_millis();
        let active_render_path = self
            .temp_workspaces_dir
            .join(format!("active_{now_ms}_zip.html"));
        let _ = fs::write(&active_render_path, &rewritten_html);

        let id = format!("zip-{now_ms}");
        self.record_active_path(&id, &active_render_path);

        let detected_duration = detect_duration_from_html(&raw_html).unwrap_or(5.0);

        Ok(ProjectData {
            id,
            title,
            mode: UploadMode::Zip,
            html_content: rewritten_html,
            render_html_path: Some(active_render_path.to_string_lossy().to_string()),
            css_content: None,
            js_content: None,
            entry_html_path: default_entry,
            available_html_files: html_files,
            assets,
            detected_duration: Some(detected_duration),
            missing_assets: Vec::new(),
        })
    }

    pub fn open_folder_project(&self, folder_path: &Path) -> Result<ProjectData> {
        let mut assets = HashMap::new();
        let mut html_files = Vec::new();
        let mut file_count = 0usize;
        let mut total_size = 0u64;

        for entry in WalkDir::new(folder_path)
            .max_depth(MAX_DEPTH)
            .follow_links(false)
            .into_iter()
            .filter_entry(|e| {
                if e.depth() == 0 {
                    return true;
                }
                let name = e.file_name().to_string_lossy();
                !name.starts_with('.') && name != "node_modules" && name != "dist"
            })
        {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue,
            };
            if !entry.file_type().is_file() || entry.file_type().is_symlink() {
                continue;
            }
            file_count += 1;
            if file_count > MAX_FILE_COUNT {
                bail!("Project folder exceeds maximum file count limit ({MAX_FILE_COUNT} files).");
            }

            let meta = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };
            if meta.len() > MAX_SINGLE_FILE_SIZE {
                continue;
            }
            total_size = total_size.saturating_add(meta.len());
            if total_size > MAX_TOTAL_EXTRACTED_SIZE {
                bail!("Project folder exceeds cumulative 150MB limit.");
            }

            let rel = entry
                .path()
                .strip_prefix(folder_path)
                .unwrap_or(entry.path())
                .to_string_lossy()
                .replace('\\', "/");
            let name = entry.file_name().to_string_lossy().to_string();
            let mime = detect_mime_type(entry.path());
            let lower = name.to_ascii_lowercase();
            if lower.ends_with(".html") || lower.ends_with(".htm") {
                html_files.push(rel.clone());
            }

            let bytes = fs::read(entry.path())?;
            let data_uri = format!("data:{};base64,{}", mime, STANDARD.encode(&bytes));
            let content = if is_text_mime(&mime) {
                String::from_utf8(bytes).ok()
            } else {
                None
            };

            assets.insert(
                rel.clone(),
                ProjectAsset {
                    path: rel,
                    name,
                    mime_type: mime,
                    size: meta.len(),
                    blob_url: data_uri,
                    content,
                },
            );
        }

        if html_files.is_empty() {
            bail!("No valid HTML entry file (.html / .htm) found in selected project directory.");
        }

        let default_entry = pick_default_entry(&html_files);
        let raw_html = assets
            .get(&default_entry)
            .and_then(|a| a.content.clone())
            .unwrap_or_default();
        let rewritten_html = rewrite_asset_references(&raw_html, &assets);
        let title = folder_path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("Folder Project")
            .to_string();

        let now_ms = chrono::Utc::now().timestamp_millis();
        let active_render_path = self
            .temp_workspaces_dir
            .join(format!("active_{now_ms}_folder.html"));
        let _ = fs::write(&active_render_path, &rewritten_html);

        let id = format!("folder-{now_ms}");
        self.record_active_path(&id, &active_render_path);

        let detected_duration = detect_duration_from_html(&raw_html).unwrap_or(5.0);

        Ok(ProjectData {
            id,
            title,
            mode: UploadMode::Folder,
            html_content: rewritten_html,
            render_html_path: Some(active_render_path.to_string_lossy().to_string()),
            css_content: None,
            js_content: None,
            entry_html_path: default_entry,
            available_html_files: html_files,
            assets,
            detected_duration: Some(detected_duration),
            missing_assets: Vec::new(),
        })
    }

    pub fn open_saved_project_file(&self, project_file_path: &Path) -> Result<ProjectData> {
        let raw = fs::read_to_string(project_file_path)?;
        let mut parsed: ProjectData = serde_json::from_str(&raw)
            .with_context(|| "Invalid project file format: failed to parse JSON")?;
        if parsed.html_content.is_empty() || parsed.title.is_empty() {
            bail!("Invalid project file format: missing required project fields.");
        }

        let now_ms = chrono::Utc::now().timestamp_millis();
        let active_render_path = self
            .temp_workspaces_dir
            .join(format!("active_{now_ms}_saved.html"));
        let _ = fs::write(&active_render_path, &parsed.html_content);
        parsed.render_html_path = Some(active_render_path.to_string_lossy().to_string());
        self.record_active_path(&parsed.id, &active_render_path);
        Ok(parsed)
    }

    pub fn save_project_to_disk(
        &self,
        project: &ProjectData,
        target_path: Option<&Path>,
    ) -> Result<PathBuf> {
        let final_path = match target_path {
            Some(p) => p.to_path_buf(),
            None => {
                let slug: String = project
                    .title
                    .to_ascii_lowercase()
                    .chars()
                    .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
                    .collect();
                self.temp_workspaces_dir.join(format!("{slug}.hmsproj"))
            }
        };
        if let Some(parent) = final_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let serialized = serde_json::to_string_pretty(project)?;
        fs::write(&final_path, serialized)?;
        Ok(final_path)
    }

    pub fn sync_render_html(&self, html_content: &str) -> Result<PathBuf> {
        let now_ms = chrono::Utc::now().timestamp_millis();
        let render_path = self
            .temp_workspaces_dir
            .join(format!("active_{now_ms}_workspace.html"));
        let content = if html_content.is_empty() {
            "<html><body></body></html>"
        } else {
            html_content
        };
        fs::write(&render_path, content)?;
        if let Ok(mut latest) = self.latest_active_render_path.lock() {
            *latest = Some(render_path.clone());
        }
        Ok(render_path)
    }

    fn record_active_path(&self, id: &str, path: &Path) {
        if let Ok(mut map) = self.active_project_paths.lock() {
            map.insert(id.to_string(), path.to_path_buf());
        }
        if let Ok(mut latest) = self.latest_active_render_path.lock() {
            *latest = Some(path.to_path_buf());
        }
    }
}

fn pick_default_entry(html_files: &[String]) -> String {
    html_files
        .iter()
        .find(|f| {
            Path::new(f)
                .file_name()
                .and_then(|s| s.to_str())
                .map(|s| s.eq_ignore_ascii_case("index.html"))
                .unwrap_or(false)
        })
        .or_else(|| html_files.iter().find(|f| !f.contains('/')))
        .or_else(|| html_files.first())
        .cloned()
        .unwrap_or_else(|| "index.html".to_string())
}

pub fn rewrite_asset_references(html: &str, assets: &HashMap<String, ProjectAsset>) -> String {
    let mut result = html.to_string();
    let mut sorted_paths: Vec<&String> = assets.keys().collect();
    sorted_paths.sort_by(|a, b| b.len().cmp(&a.len()));

    for asset_path in sorted_paths {
        let Some(asset) = assets.get(asset_path) else {
            continue;
        };
        if asset.blob_url.is_empty() {
            continue;
        }
        let basename = Path::new(asset_path)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or(asset_path);

        let variations = [
            asset_path.as_str(),
            &format!("./{asset_path}"),
            &format!("/{asset_path}"),
            basename,
            &format!("./{basename}"),
        ];

        for variant in variations {
            let escaped = regex::escape(variant);
            if let Ok(src_re) = Regex::new(&format!(r#"(?i)(src\s*=\s*["']){escaped}(["'])"#)) {
                result = src_re
                    .replace_all(&result, |caps: &regex::Captures| {
                        format!("{}{}{}", &caps[1], asset.blob_url, &caps[2])
                    })
                    .into_owned();
            }
            if let Ok(href_re) = Regex::new(&format!(r#"(?i)(href\s*=\s*["']){escaped}(["'])"#)) {
                result = href_re
                    .replace_all(&result, |caps: &regex::Captures| {
                        format!("{}{}{}", &caps[1], asset.blob_url, &caps[2])
                    })
                    .into_owned();
            }
            if let Ok(url_re) =
                Regex::new(&format!(r#"(?i)(url\s*\(\s*["']?){escaped}(["']?\s*\))"#))
            {
                result = url_re
                    .replace_all(&result, |caps: &regex::Captures| {
                        format!("{}{}{}", &caps[1], asset.blob_url, &caps[2])
                    })
                    .into_owned();
            }
        }
    }
    result
}

pub fn detect_duration_from_html(raw_html: &str) -> Option<f64> {
    let re = Regex::new(
        r"(?i)(?:TOTAL_DURATION|duration|videoDuration|DURATION_SECONDS)\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)",
    )
    .ok()?;
    if let Some(caps) = re.captures(raw_html) {
        if let Some(m) = caps.get(1) {
            if let Ok(parsed) = m.as_str().parse::<f64>() {
                if parsed > 0.0 && parsed <= 300.0 {
                    return Some((parsed * 10.0).round() / 10.0);
                }
            }
        }
    }
    None
}

pub fn detect_mime_type(path: &Path) -> String {
    let ext = path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    match ext.as_str() {
        "html" | "htm" => "text/html",
        "css" => "text/css",
        "js" | "mjs" => "application/javascript",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "aac" => "audio/aac",
        "m4a" => "audio/mp4",
        "ogg" => "audio/ogg",
        "flac" => "audio/flac",
        _ => "application/octet-stream",
    }
    .to_string()
}

fn is_text_mime(mime: &str) -> bool {
    mime.starts_with("text/") || mime.contains("javascript") || mime.contains("svg") || mime.contains("json")
}
