import Foundation
import CHMSCore

struct HMSCoreError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

private struct FFIEnvelope<T: Decodable>: Decodable {
    let ok: Bool
    let data: T?
    let error: String?
}

private final class ProgressCallbackBox: @unchecked Sendable {
    let handler: @Sendable (DesktopExportProgress) -> Void
    init(_ handler: @escaping @Sendable (DesktopExportProgress) -> Void) {
        self.handler = handler
    }
}

private let cProgressTrampoline: HmsProgressCallback = { rawPtr, userData in
    guard let rawPtr, let userData else { return }
    let box = Unmanaged<ProgressCallbackBox>.fromOpaque(userData).takeUnretainedValue()
    let jsonStr = String(cString: rawPtr)
    if let data = jsonStr.data(using: .utf8),
       let progress = try? JSONDecoder().decode(DesktopExportProgress.self, from: data) {
        box.handler(progress)
    }
}

/// Thread-safe Swift wrapper around the shared Rust `hms-core` C-ABI engine (`libhms_ffi.a`).
final class HMSCoreClient: @unchecked Sendable {
    private let handle: OpaquePointer
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(userDataDir: String? = nil) throws {
        let ptr: OpaquePointer?
        if let dir = userDataDir {
            ptr = dir.withCString { hms_core_create($0) }
        } else {
            ptr = hms_core_create(nil)
        }
        guard let valid = ptr else {
            throw HMSCoreError(message: "Failed to initialize native Rust hms-core engine")
        }
        self.handle = valid
    }

    deinit {
        hms_core_destroy(handle)
    }

    private func decodeEnvelope<T: Decodable>(_ rawPtr: UnsafeMutablePointer<CChar>?) throws -> T {
        guard let rawPtr else {
            throw HMSCoreError(message: "Null response from Rust core")
        }
        defer { hms_string_free(rawPtr) }
        let jsonStr = String(cString: rawPtr)
        guard let data = jsonStr.data(using: .utf8) else {
            throw HMSCoreError(message: "Invalid UTF-8 returned from Rust core")
        }
        let env = try decoder.decode(FFIEnvelope<T>.self, from: data)
        if env.ok, let payload = env.data {
            return payload
        }
        throw HMSCoreError(message: env.error ?? "Unknown Rust core error")
    }

    func getSystemCapabilities() throws -> DesktopSystemCapabilities {
        try decodeEnvelope(hms_get_system_capabilities(handle))
    }

    func getTemplates() throws -> [SampleTemplate] {
        try decodeEnvelope(hms_get_templates(handle))
    }

    func createProject(title: String? = nil, templateId: String? = nil) throws -> ProjectData {
        let raw: UnsafeMutablePointer<CChar>? = withOptionalCString(title) { tPtr in
            withOptionalCString(templateId) { idPtr in
                hms_create_project(handle, tPtr, idPtr)
            }
        }
        return try decodeEnvelope(raw)
    }

    func openProject(path: String) throws -> ProjectData {
        let raw = path.withCString { hms_open_project_from_path(handle, $0) }
        return try decodeEnvelope(raw)
    }

    func saveProject(_ project: ProjectData, targetPath: String? = nil) throws -> SaveProjectResponse {
        let jsonData = try encoder.encode(project)
        let jsonStr = String(decoding: jsonData, as: UTF8.self)
        let raw: UnsafeMutablePointer<CChar>? = jsonStr.withCString { pPtr in
            withOptionalCString(targetPath) { tPtr in
                hms_save_project_to_disk(handle, pPtr, tPtr)
            }
        }
        return try decodeEnvelope(raw)
    }

    func syncRenderHtml(_ html: String) throws -> SyncRenderHtmlResponse {
        let raw = html.withCString { hms_sync_render_html(handle, $0) }
        return try decodeEnvelope(raw)
    }

    func injectPreviewHtml(_ rawHtml: String) throws -> String {
        let raw = rawHtml.withCString { hms_inject_preview_html(handle, $0) }
        return try decodeEnvelope(raw)
    }

    func inspectCode(html: String, css: String? = nil, js: String? = nil, missingAssets: [String] = []) throws -> CompatibilityReport {
        let missingData = try encoder.encode(missingAssets)
        let missingStr = String(decoding: missingData, as: UTF8.self)
        let raw: UnsafeMutablePointer<CChar>? = html.withCString { hPtr in
            withOptionalCString(css) { cPtr in
                withOptionalCString(js) { jPtr in
                    missingStr.withCString { mPtr in
                        hms_inspect_code(handle, hPtr, cPtr, jPtr, mPtr)
                    }
                }
            }
        }
        return try decodeEnvelope(raw)
    }

    func getRecentProjects(limit: UInt32 = 12) throws -> [RecentProjectItem] {
        try decodeEnvelope(hms_get_recent_projects(handle, limit))
    }

    func removeRecentProject(id: String) throws {
        let _: Bool = try decodeEnvelope(id.withCString { hms_remove_recent_project(handle, $0) })
    }

    func clearRecentProjects() throws {
        let _: Bool = try decodeEnvelope(hms_clear_recent_projects(handle))
    }

    func verifyVideo(path: String) throws -> FFprobeValidationResult {
        try decodeEnvelope(path.withCString { hms_verify_video(handle, $0) })
    }

    func startExport(
        config: DesktopExportJobConfig,
        onProgress: @escaping @Sendable (DesktopExportProgress) -> Void
    ) throws -> ExportOutcome {
        let jsonData = try encoder.encode(config)
        let jsonStr = String(decoding: jsonData, as: UTF8.self)
        let box = ProgressCallbackBox(onProgress)
        let unmanaged = Unmanaged.passRetained(box)
        defer { unmanaged.release() }

        let raw = jsonStr.withCString { cfgPtr in
            hms_start_export(handle, cfgPtr, cProgressTrampoline, unmanaged.toOpaque())
        }
        return try decodeEnvelope(raw)
    }

    func cancelExport() {
        hms_cancel_export(handle)
    }

    func openPath(_ path: String) throws {
        let _: Bool = try decodeEnvelope(path.withCString { hms_open_path(handle, $0) })
    }

    func showItemInFolder(_ path: String) throws {
        let _: Bool = try decodeEnvelope(path.withCString { hms_show_item_in_folder(handle, $0) })
    }
}

private func withOptionalCString<R>(_ string: String?, _ body: (UnsafePointer<CChar>?) -> R) -> R {
    if let string {
        return string.withCString { body($0) }
    } else {
        return body(nil)
    }
}
