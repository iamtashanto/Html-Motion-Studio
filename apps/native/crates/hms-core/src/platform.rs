use anyhow::Result;
use std::path::{Path, PathBuf};
use std::process::Command;

pub fn default_user_data_dir() -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = std::env::var("HOME") {
            return PathBuf::from(home)
                .join("Library")
                .join("Application Support")
                .join("HTML Motion Studio");
        }
    }
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            return PathBuf::from(appdata).join("HTML Motion Studio");
        }
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        if let Ok(xdg) = std::env::var("XDG_DATA_HOME") {
            return PathBuf::from(xdg).join("html-motion-studio");
        }
        if let Ok(home) = std::env::var("HOME") {
            return PathBuf::from(home)
                .join(".local")
                .join("share")
                .join("html-motion-studio");
        }
    }
    std::env::temp_dir().join("html-motion-studio")
}

pub fn default_export_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        if let Ok(profile) = std::env::var("USERPROFILE") {
            let videos = PathBuf::from(&profile).join("Videos");
            if videos.exists() {
                return videos;
            }
            return PathBuf::from(profile);
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(home) = std::env::var("HOME") {
            let movies = PathBuf::from(&home).join("Movies");
            if movies.exists() {
                return movies;
            }
            let videos = PathBuf::from(&home).join("Videos");
            if videos.exists() {
                return videos;
            }
            return PathBuf::from(home);
        }
    }
    std::env::temp_dir()
}

pub fn resolve_binary(binary_name: &str, env_var: &str) -> Option<PathBuf> {
    if let Ok(val) = std::env::var(env_var) {
        let p = PathBuf::from(val);
        if p.is_file() {
            return Some(p);
        }
    }

    // Check PATH via `which` / `where`
    let lookup_cmd = if cfg!(target_os = "windows") {
        "where"
    } else {
        "which"
    };
    if let Ok(out) = Command::new(lookup_cmd).arg(binary_name).output() {
        if out.status.success() {
            let text = String::from_utf8_lossy(&out.stdout);
            if let Some(first_line) = text.lines().next() {
                let p = PathBuf::from(first_line.trim());
                if p.is_file() {
                    return Some(p);
                }
            }
        }
    }

    let common_paths: Vec<PathBuf> = if cfg!(target_os = "windows") {
        vec![
            PathBuf::from(format!(r"C:\Program Files\ffmpeg\bin\{binary_name}.exe")),
            PathBuf::from(format!(r"C:\ffmpeg\bin\{binary_name}.exe")),
        ]
    } else {
        vec![
            PathBuf::from(format!("/opt/homebrew/bin/{binary_name}")),
            PathBuf::from(format!("/usr/local/bin/{binary_name}")),
            PathBuf::from(format!("/usr/bin/{binary_name}")),
        ]
    };

    common_paths.into_iter().find(|p| p.is_file())
}

pub fn resolve_chromium_binary() -> Option<PathBuf> {
    if let Ok(val) = std::env::var("HMS_CHROME_PATH").or_else(|_| std::env::var("CHROME_PATH")) {
        let p = PathBuf::from(val);
        if p.is_file() {
            return Some(p);
        }
    }

    let candidates: Vec<PathBuf> = if cfg!(target_os = "macos") {
        vec![
            PathBuf::from("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
            PathBuf::from("/Applications/Chromium.app/Contents/MacOS/Chromium"),
            PathBuf::from("/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"),
            PathBuf::from("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
            PathBuf::from("/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"),
        ]
    } else if cfg!(target_os = "windows") {
        let mut list = vec![
            PathBuf::from(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
            PathBuf::from(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
            PathBuf::from(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
            PathBuf::from(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
            PathBuf::from(r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"),
        ];
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            list.push(PathBuf::from(local).join(r"Google\Chrome\Application\chrome.exe"));
        }
        list
    } else {
        vec![
            PathBuf::from("/usr/bin/google-chrome"),
            PathBuf::from("/usr/bin/google-chrome-stable"),
            PathBuf::from("/usr/bin/chromium"),
            PathBuf::from("/usr/bin/chromium-browser"),
            PathBuf::from("/snap/bin/chromium"),
            PathBuf::from("/usr/bin/brave-browser"),
            PathBuf::from("/usr/bin/microsoft-edge"),
        ]
    };

    if let Some(found) = candidates.into_iter().find(|p| p.is_file()) {
        return Some(found);
    }

    for name in ["google-chrome", "chromium", "chromium-browser", "msedge"] {
        if let Some(p) = resolve_binary(name, "__HMS_UNUSED__") {
            return Some(p);
        }
    }
    None
}

pub fn open_path_in_os(path: &Path) -> Result<()> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open").arg(path).spawn()?;
    }
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &path.to_string_lossy()])
            .spawn()?;
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Command::new("xdg-open").arg(path).spawn()?;
    }
    Ok(())
}

pub fn show_item_in_folder(path: &Path) -> Result<()> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open").args(["-R"]).arg(path).spawn()?;
    }
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(format!("/select,{}", path.display()))
            .spawn()?;
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let parent = path.parent().unwrap_or(path);
        Command::new("xdg-open").arg(parent).spawn()?;
    }
    Ok(())
}

pub fn os_name() -> &'static str {
    if cfg!(target_os = "macos") {
        "darwin"
    } else if cfg!(target_os = "windows") {
        "win32"
    } else {
        "linux"
    }
}
