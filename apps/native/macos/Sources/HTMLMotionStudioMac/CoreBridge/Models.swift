import Foundation

struct ProjectAsset: Codable, Sendable, Identifiable {
    var id: String { path }
    let path: String
    let name: String
    let type: String
    let size: UInt64
    let blobUrl: String
    let content: String?
}

struct ProjectData: Codable, Sendable {
    var id: String
    var title: String
    var mode: String
    var htmlContent: String
    var renderHtmlPath: String?
    var cssContent: String?
    var jsContent: String?
    var entryHtmlPath: String
    var availableHtmlFiles: [String]
    var assets: [String: ProjectAsset]
    var detectedDuration: Double?
    var missingAssets: [String]
}

struct SampleTemplate: Codable, Sendable, Identifiable {
    let id: String
    let name: String
    let category: String
    let description: String
    let defaultDuration: Double
    let html: String
    let expectedStatus: String
}

struct RecentProjectItem: Codable, Sendable, Identifiable {
    let id: String
    let title: String
    let filePath: String
    let mode: String
    let lastOpened: Int64
    let duration: Double
}

struct DesktopSystemCapabilities: Codable, Sendable {
    let os: String
    let arch: String
    let ffmpegAvailable: Bool
    let ffmpegPath: String
    let ffmpegVersion: String
    let ffprobeAvailable: Bool
    let ffprobePath: String
    let ffprobeVersion: String
    let chromiumAvailable: Bool
    let chromiumPath: String
    let gpuAcceleration: Bool
}

struct ExportSettings: Codable, Sendable {
    var aspectRatio: String = "16:9"
    var width: Int = 1920
    var height: Int = 1080
    var resolution: String = "1080p"
    var fps: Int = 60
    var format: String = "mp4"
    var quality: String = "high"
    var videoBitrateMbps: Int = 16
    var audioBitrateKbps: Int = 256
    var durationPolicy: String = "project"
    var durationSeconds: Double = 4.0
    var loopAnimationIfShorter: Bool = true
    var filename: String = "desktop-export"
    var engineStrategy: String = "auto"
}

struct AudioSettings: Codable, Sendable {
    var sourceMode: String = "none"
    var fileName: String? = nil
    var durationSeconds: Double = 0
    var volume: Double = 1.0
    var startOffsetSeconds: Double = 0
    var trimInSeconds: Double = 0
    var trimOutSeconds: Double = 0
    var fadeInSeconds: Double = 0.5
    var fadeOutSeconds: Double = 0.5
}

struct DesktopExportJobConfig: Codable, Sendable {
    let jobId: String
    let project: ProjectData
    let settings: ExportSettings
    let audioSettings: AudioSettings
    let audioFilePath: String?
    let outputFilePath: String
    let strategy: String
}

struct DesktopExportProgress: Codable, Sendable {
    let jobId: String
    let status: String
    let currentFrame: Int
    let totalFrames: Int
    let percentage: Int
    let elapsedMs: UInt64
    let estimatedRemainingMs: UInt64
    let currentFps: Double
    let message: String
    let error: String?
}

struct VideoStreamInfo: Codable, Sendable {
    let codec: String
    let width: Int
    let height: Int
    let fps: Int
    let frameCount: UInt64?
    let pixelFormat: String?
}

struct AudioStreamInfo: Codable, Sendable {
    let codec: String
    let sampleRate: Int
    let channels: Int
    let durationSeconds: Double
}

struct FFprobeValidationResult: Codable, Sendable {
    let valid: Bool
    let formatName: String
    let durationSeconds: Double
    let sizeBytes: UInt64
    let bitrate: UInt64
    let video: VideoStreamInfo?
    let audio: AudioStreamInfo?
    let error: String?
}

struct ExportOutcome: Codable, Sendable {
    let outputFilePath: String
    let validation: FFprobeValidationResult
}

struct CompatibilityCheckItem: Codable, Sendable, Identifiable {
    let id: String
    let name: String
    let detected: Bool
    let status: String
    let details: String
}

struct DetectedFeatures: Codable, Sendable {
    let hasHtml: Bool
    let hasCssAnimations: Bool
    let hasCssTransitions: Bool
    let hasRaf: Bool
    let hasCanvas: Bool
    let hasSvg: Bool
    let hasWebgl: Bool
    let hasAudio: Bool
    let externalUrls: [String]
    let missingAssets: [String]
    let corsRisks: Bool
    let detectedDuration: Double?
}

struct CompatibilityReport: Codable, Sendable {
    let overallStatus: String
    let summary: String
    let checks: [CompatibilityCheckItem]
    let detectedFeatures: DetectedFeatures
    let recommendedStrategy: String
    let warnings: [String]
}

struct SaveProjectResponse: Codable, Sendable {
    let success: Bool
    let filePath: String
}

struct SyncRenderHtmlResponse: Codable, Sendable {
    let success: Bool
    let renderHtmlPath: String
}

enum PreviewZoom: String, CaseIterable, Identifiable {
    case fit = "Fit"
    case p50 = "50%"
    case p75 = "75%"
    case p100 = "100%"
    var id: String { rawValue }
}

enum PreviewBackground: String, CaseIterable, Identifiable {
    case dark = "Dark"
    case grid = "Grid"
    case checker = "Checker"
    case light = "Light"
    var id: String { rawValue }
}
