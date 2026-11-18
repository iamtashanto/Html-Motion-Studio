use std::path::PathBuf;
use std::process::Command;

/// Zero-dependency native OS file/folder/save dialogs for Windows, Linux, and macOS.
/// Windows uses PowerShell WinForms native file dialogs; Linux uses zenity/kdialog;
/// macOS uses osascript (primarily when running the Rust UI on macOS for cross-platform testing).

pub fn open_project_file_dialog() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.OpenFileDialog
$d.Title = 'Open HTML Motion Project'
$d.Filter = 'Motion Projects (*.html;*.htm;*.zip;*.hmsproj)|*.html;*.htm;*.zip;*.hmsproj|All Files (*.*)|*.*'
if ($d.ShowDialog() -eq 'OK') { Write-Output $d.FileName }
"#;
        run_powershell(script)
    }
    #[cfg(target_os = "linux")]
    {
        run_zenity(&[
            "--file-selection",
            "--title=Open HTML Motion Project",
            "--file-filter=Motion Projects | *.html *.htm *.zip *.hmsproj",
        ])
    }
    #[cfg(target_os = "macos")]
    {
        run_osascript(
            r#"POSIX path of (choose file with prompt "Open HTML, ZIP, or .hmsproj Project")"#,
        )
    }
}

pub fn open_project_folder_dialog() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.FolderBrowserDialog
$d.Description = 'Select HTML Project Folder'
if ($d.ShowDialog() -eq 'OK') { Write-Output $d.SelectedPath }
"#;
        run_powershell(script)
    }
    #[cfg(target_os = "linux")]
    {
        run_zenity(&[
            "--file-selection",
            "--directory",
            "--title=Select HTML Project Folder",
        ])
    }
    #[cfg(target_os = "macos")]
    {
        run_osascript(r#"POSIX path of (choose folder with prompt "Select HTML Project Folder")"#)
    }
}

pub fn open_audio_file_dialog() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.OpenFileDialog
$d.Title = 'Select Soundtrack Audio'
$d.Filter = 'Audio Files (*.mp3;*.wav;*.aac;*.m4a;*.ogg;*.flac)|*.mp3;*.wav;*.aac;*.m4a;*.ogg;*.flac'
if ($d.ShowDialog() -eq 'OK') { Write-Output $d.FileName }
"#;
        run_powershell(script)
    }
    #[cfg(target_os = "linux")]
    {
        run_zenity(&[
            "--file-selection",
            "--title=Select Soundtrack Audio",
            "--file-filter=Audio Files | *.mp3 *.wav *.aac *.m4a *.ogg *.flac",
        ])
    }
    #[cfg(target_os = "macos")]
    {
        run_osascript(r#"POSIX path of (choose file with prompt "Select Soundtrack Audio")"#)
    }
}

pub fn save_video_file_dialog(default_name: &str, format: &str) -> Option<PathBuf> {
    let fname = format!("{default_name}.{format}");
    #[cfg(target_os = "windows")]
    {
        let script = format!(
            r#"
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.SaveFileDialog
$d.Title = 'Export Video Destination'
$d.FileName = '{fname}'
$d.Filter = 'Video (*.{format})|*.{format}|All Files (*.*)|*.*'
if ($d.ShowDialog() -eq 'OK') {{ Write-Output $d.FileName }}
"#
        );
        run_powershell(&script)
    }
    #[cfg(target_os = "linux")]
    {
        run_zenity(&[
            "--file-selection",
            "--save",
            "--confirm-overwrite",
            "--title=Export Video Destination",
            &format!("--filename={fname}"),
        ])
    }
    #[cfg(target_os = "macos")]
    {
        run_osascript(&format!(
            r#"POSIX path of (choose file name with prompt "Export Video Destination" default name "{fname}")"#
        ))
    }
}

#[cfg(target_os = "windows")]
fn run_powershell(script: &str) -> Option<PathBuf> {
    let out = Command::new("powershell")
        .args(["-NoProfile", "-STA", "-Command", script])
        .output()
        .ok()?;
    if !out.status.success() {
        return None;
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if s.is_empty() {
        None
    } else {
        Some(PathBuf::from(s))
    }
}

#[cfg(target_os = "linux")]
fn run_zenity(args: &[&str]) -> Option<PathBuf> {
    let out = Command::new("zenity").args(args).output().ok()?;
    if !out.status.success() {
        return None;
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if s.is_empty() {
        None
    } else {
        Some(PathBuf::from(s))
    }
}

#[cfg(target_os = "macos")]
fn run_osascript(script: &str) -> Option<PathBuf> {
    let out = Command::new("osascript").args(["-e", script]).output().ok()?;
    if !out.status.success() {
        return None;
    }
    let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
    if s.is_empty() {
        None
    } else {
        Some(PathBuf::from(s))
    }
}
