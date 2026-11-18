use hms_core::models::{DesktopExportJobConfig, ProjectData};
use hms_core::StudioCore;
use serde::Serialize;
use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_void};
use std::path::{Path, PathBuf};

pub struct HmsCoreHandle {
    core: StudioCore,
}

pub type HmsProgressCallback = Option<extern "C" fn(*const c_char, *mut c_void)>;

#[derive(Serialize)]
struct FfiResponse<T: Serialize> {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

fn to_c_string(s: String) -> *mut c_char {
    let clean = s.replace('\0', "");
    CString::new(clean)
        .unwrap_or_else(|_| CString::new("{}").unwrap())
        .into_raw()
}

fn ok_json<T: Serialize>(data: T) -> *mut c_char {
    let resp = FfiResponse {
        ok: true,
        data: Some(data),
        error: None,
    };
    to_c_string(serde_json::to_string(&resp).unwrap_or_else(|_| r#"{"ok":false,"error":"Serialization error"}"#.into()))
}

fn err_json(msg: impl Into<String>) -> *mut c_char {
    let resp: FfiResponse<()> = FfiResponse {
        ok: false,
        data: None,
        error: Some(msg.into()),
    };
    to_c_string(serde_json::to_string(&resp).unwrap_or_else(|_| r#"{"ok":false,"error":"Unknown FFI error"}"#.into()))
}

unsafe fn opt_str<'a>(ptr: *const c_char) -> Option<&'a str> {
    if ptr.is_null() {
        None
    } else {
        CStr::from_ptr(ptr).to_str().ok()
    }
}

unsafe fn handle_ref<'a>(ptr: *mut HmsCoreHandle) -> Result<&'a StudioCore, *mut c_char> {
    if ptr.is_null() {
        Err(err_json("Null HmsCoreHandle pointer"))
    } else {
        Ok(&(*ptr).core)
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_core_create(user_data_dir_or_null: *const c_char) -> *mut HmsCoreHandle {
    let dir = opt_str(user_data_dir_or_null)
        .filter(|s| !s.is_empty())
        .map(PathBuf::from);
    match StudioCore::initialize(dir) {
        Ok(core) => Box::into_raw(Box::new(HmsCoreHandle { core })),
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_core_destroy(handle: *mut HmsCoreHandle) {
    if !handle.is_null() {
        drop(Box::from_raw(handle));
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_string_free(ptr: *mut c_char) {
    if !ptr.is_null() {
        drop(CString::from_raw(ptr));
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_get_system_capabilities(handle: *mut HmsCoreHandle) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    ok_json(core.get_system_capabilities())
}

#[no_mangle]
pub unsafe extern "C" fn hms_get_templates(handle: *mut HmsCoreHandle) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    ok_json(core.get_templates())
}

#[no_mangle]
pub unsafe extern "C" fn hms_create_project(
    handle: *mut HmsCoreHandle,
    title_or_null: *const c_char,
    template_id_or_null: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let proj = core.create_project(opt_str(title_or_null), opt_str(template_id_or_null));
    ok_json(proj)
}

#[no_mangle]
pub unsafe extern "C" fn hms_open_project_from_path(
    handle: *mut HmsCoreHandle,
    path: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(path_str) = opt_str(path) else {
        return err_json("Invalid path argument");
    };
    match core.open_project_from_path(Path::new(path_str)) {
        Ok(proj) => ok_json(proj),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_save_project_to_disk(
    handle: *mut HmsCoreHandle,
    project_json: *const c_char,
    target_path_or_null: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(json_str) = opt_str(project_json) else {
        return err_json("Invalid project_json");
    };
    let project: ProjectData = match serde_json::from_str(json_str) {
        Ok(p) => p,
        Err(e) => return err_json(format!("Failed to parse project JSON: {e}")),
    };
    let target = opt_str(target_path_or_null)
        .filter(|s| !s.is_empty())
        .map(Path::new);
    match core.save_project_to_disk(&project, target) {
        Ok(saved_path) => ok_json(serde_json::json!({
            "success": true,
            "filePath": saved_path.to_string_lossy().to_string()
        })),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_sync_render_html(
    handle: *mut HmsCoreHandle,
    html_content: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let html = opt_str(html_content).unwrap_or("");
    match core.sync_render_html(html) {
        Ok(path) => ok_json(serde_json::json!({
            "success": true,
            "renderHtmlPath": path.to_string_lossy().to_string()
        })),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_inject_preview_html(
    handle: *mut HmsCoreHandle,
    raw_html: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let html = opt_str(raw_html).unwrap_or("");
    ok_json(core.inject_preview_html(html))
}

#[no_mangle]
pub unsafe extern "C" fn hms_inspect_code(
    handle: *mut HmsCoreHandle,
    html: *const c_char,
    css_or_null: *const c_char,
    js_or_null: *const c_char,
    missing_assets_json_or_null: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let html_str = opt_str(html).unwrap_or("");
    let missing: Vec<String> = opt_str(missing_assets_json_or_null)
        .and_then(|s| serde_json::from_str(s).ok())
        .unwrap_or_default();
    ok_json(core.inspect_code(html_str, opt_str(css_or_null), opt_str(js_or_null), &missing))
}

#[no_mangle]
pub unsafe extern "C" fn hms_get_recent_projects(
    handle: *mut HmsCoreHandle,
    limit: u32,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    match core.get_recent_projects(limit.max(1) as usize) {
        Ok(items) => ok_json(items),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_remove_recent_project(
    handle: *mut HmsCoreHandle,
    id: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(id_str) = opt_str(id) else {
        return err_json("Invalid id");
    };
    match core.remove_recent_project(id_str) {
        Ok(()) => ok_json(true),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_clear_recent_projects(handle: *mut HmsCoreHandle) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    match core.clear_recent_projects() {
        Ok(()) => ok_json(true),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_verify_video(
    handle: *mut HmsCoreHandle,
    file_path: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(p) = opt_str(file_path) else {
        return err_json("Invalid file_path");
    };
    ok_json(core.verify_video(Path::new(p)))
}

#[no_mangle]
pub unsafe extern "C" fn hms_start_export(
    handle: *mut HmsCoreHandle,
    config_json: *const c_char,
    callback: HmsProgressCallback,
    user_data: *mut c_void,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(json_str) = opt_str(config_json) else {
        return err_json("Invalid config_json");
    };
    let config: DesktopExportJobConfig = match serde_json::from_str(json_str) {
        Ok(c) => c,
        Err(e) => return err_json(format!("Failed to parse export config JSON: {e}")),
    };

    let outcome = core.start_export(&config, |progress| {
        if let Some(cb) = callback {
            if let Ok(serialized) = serde_json::to_string(&progress) {
                if let Ok(cstr) = CString::new(serialized.replace('\0', "")) {
                    cb(cstr.as_ptr(), user_data);
                }
            }
        }
    });

    match outcome {
        Ok(res) => ok_json(res),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_cancel_export(handle: *mut HmsCoreHandle) {
    if !handle.is_null() {
        (*handle).core.cancel_export();
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_open_path(
    handle: *mut HmsCoreHandle,
    path: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(p) = opt_str(path) else {
        return err_json("Invalid path");
    };
    match core.open_path(Path::new(p)) {
        Ok(()) => ok_json(true),
        Err(e) => err_json(e.to_string()),
    }
}

#[no_mangle]
pub unsafe extern "C" fn hms_show_item_in_folder(
    handle: *mut HmsCoreHandle,
    path: *const c_char,
) -> *mut c_char {
    let core = match handle_ref(handle) {
        Ok(c) => c,
        Err(e) => return e,
    };
    let Some(p) = opt_str(path) else {
        return err_json("Invalid path");
    };
    match core.show_item_in_folder(Path::new(p)) {
        Ok(()) => ok_json(true),
        Err(e) => err_json(e.to_string()),
    }
}
