#ifndef HMS_CORE_H
#define HMS_CORE_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct HmsCoreHandle HmsCoreHandle;

typedef void (*HmsProgressCallback)(const char *progress_json, void *user_data);

HmsCoreHandle *hms_core_create(const char *user_data_dir_or_null);
void hms_core_destroy(HmsCoreHandle *handle);
void hms_string_free(char *ptr);

char *hms_get_system_capabilities(HmsCoreHandle *handle);
char *hms_get_templates(HmsCoreHandle *handle);
char *hms_create_project(HmsCoreHandle *handle, const char *title_or_null, const char *template_id_or_null);
char *hms_open_project_from_path(HmsCoreHandle *handle, const char *path);
char *hms_save_project_to_disk(HmsCoreHandle *handle, const char *project_json, const char *target_path_or_null);
char *hms_sync_render_html(HmsCoreHandle *handle, const char *html_content);
char *hms_inject_preview_html(HmsCoreHandle *handle, const char *raw_html);
char *hms_inspect_code(HmsCoreHandle *handle, const char *html, const char *css_or_null, const char *js_or_null, const char *missing_assets_json_or_null);
char *hms_get_recent_projects(HmsCoreHandle *handle, uint32_t limit);
char *hms_remove_recent_project(HmsCoreHandle *handle, const char *id);
char *hms_clear_recent_projects(HmsCoreHandle *handle);
char *hms_verify_video(HmsCoreHandle *handle, const char *file_path);
char *hms_start_export(HmsCoreHandle *handle, const char *config_json, HmsProgressCallback callback, void *user_data);
void hms_cancel_export(HmsCoreHandle *handle);
char *hms_open_path(HmsCoreHandle *handle, const char *path);
char *hms_show_item_in_folder(HmsCoreHandle *handle, const char *path);

#ifdef __cplusplus
}
#endif

#endif /* HMS_CORE_H */
