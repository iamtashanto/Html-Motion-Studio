import Foundation
import AppKit
import AVFoundation
import UniformTypeIdentifiers

@MainActor
final class StudioStore: ObservableObject {
    let core: HMSCoreClient

    // Project & Persistence
    @Published var project: ProjectData
    @Published var projectFilePath: String? = nil
    @Published var isDirty: Bool = false
    @Published var recentProjects: [RecentProjectItem] = []
    @Published var templates: [SampleTemplate] = []
    @Published var capabilities: DesktopSystemCapabilities? = nil
    @Published var compatibilityReport: CompatibilityReport? = nil

    // Preview & Viewport
    @Published var isPlaying: Bool = false
    @Published var currentTime: Double = 0.0
    @Published var previewZoom: PreviewZoom = .fit
    @Published var previewBackground: PreviewBackground = .dark
    @Published var previewReloadToken: UUID = UUID()
    @Published var injectedPreviewHtml: String = ""

    // Timeline
    @Published var markers: [Double] = [1.0, 2.5]
    @Published var timelineZoom: Int = 1
    @Published var timeInFrames: Bool = false

    // Audio
    @Published var audioSettings = AudioSettings()
    @Published var audioFilePath: String? = nil
    private var audioPlayer: AVAudioPlayer? = nil

    // Export Settings
    @Published var exportSettings = ExportSettings()
    @Published var exportStrategy: String = "compatibility"
    @Published var outputDirectory: String
    @Published var outputFilename: String = "desktop-export"

    // Export Execution
    @Published var isExporting: Bool = false
    @Published var exportProgress: DesktopExportProgress? = nil
    @Published var exportResult: ExportOutcome? = nil
    @Published var exportError: String? = nil

    // Layout & Modals
    @Published var showLeftSidebar: Bool = true
    @Published var showRightPanel: Bool = true
    @Published var showTimeline: Bool = true
    @Published var showNewProjectSheet: Bool = false
    @Published var showCodeEditorSheet: Bool = false

    private var playbackTimer: Timer? = nil
    private var lastTickDate: Date = Date()

    init() {
        let client = try! HMSCoreClient()
        self.core = client

        let loadedTemplates = (try? client.getTemplates()) ?? []
        self.templates = loadedTemplates

        let initial = (try? client.createProject(title: nil, templateId: "2-css-keyframes"))
            ?? ProjectData(
                id: "default-mac",
                title: "CSS Keyframe Motion",
                mode: "code",
                htmlContent: "<html><body style='background:#090d16;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui'><h1>HTML Motion Studio</h1></body></html>",
                renderHtmlPath: nil,
                cssContent: nil,
                jsContent: nil,
                entryHtmlPath: "index.html",
                availableHtmlFiles: ["index.html"],
                assets: [:],
                detectedDuration: 4.0,
                missingAssets: []
            )
        let moviesUrl = FileManager.default.urls(for: .moviesDirectory, in: .userDomainMask).first
            ?? FileManager.default.homeDirectoryForCurrentUser
        self.outputDirectory = moviesUrl.path
        self.project = initial
        self.exportSettings.durationSeconds = initial.detectedDuration ?? 4.0
        self.outputFilename = Self.slugify(initial.title)

        self.capabilities = try? client.getSystemCapabilities()
        self.recentProjects = (try? client.getRecentProjects(limit: 12)) ?? []
        self.refreshDerivedProjectState()
    }

    static func slugify(_ input: String) -> String {
        let lowered = input.lowercased()
        let mapped = lowered.map { ch -> Character in
            (ch.isASCII && (ch.isLetter || ch.isNumber)) ? ch : "-"
        }
        let s = String(mapped).trimmingCharacters(in: CharacterSet(charactersIn: "-"))
        return s.isEmpty ? "desktop-export" : s
    }

    func refreshDerivedProjectState() {
        self.injectedPreviewHtml = (try? core.injectPreviewHtml(project.htmlContent)) ?? project.htmlContent
        self.compatibilityReport = try? core.inspectCode(
            html: project.htmlContent,
            css: project.cssContent,
            js: project.jsContent,
            missingAssets: project.missingAssets
        )
    }

    // MARK: - Project Lifecycle

    func createProject(title: String, templateId: String) {
        stopPlayback()
        if let created = try? core.createProject(title: title, templateId: templateId) {
            self.project = created
            self.projectFilePath = nil
            self.isDirty = false
            self.currentTime = 0
            self.exportSettings.durationSeconds = created.detectedDuration ?? 4.0
            self.outputFilename = Self.slugify(created.title)
            self.previewReloadToken = UUID()
            self.refreshDerivedProjectState()
        }
    }

    func openProjectFileDialog() {
        let panel = NSOpenPanel()
        panel.title = "Open HTML, ZIP, or Motion Studio Project"
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = false
        panel.allowedContentTypes = [
            .html,
            .zip,
            .json,
            UTType(filenameExtension: "hmsproj") ?? .data
        ]
        if panel.runModal() == .OK, let url = panel.url {
            openProject(from: url.path)
        }
    }

    func openProjectFolderDialog() {
        let panel = NSOpenPanel()
        panel.title = "Open HTML Project Folder"
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK, let url = panel.url {
            openProject(from: url.path)
        }
    }

    func openProject(from path: String) {
        stopPlayback()
        do {
            let loaded = try core.openProject(path: path)
            self.project = loaded
            self.projectFilePath = path
            self.isDirty = false
            self.currentTime = 0
            self.exportSettings.durationSeconds = loaded.detectedDuration ?? 4.0
            self.outputFilename = Self.slugify(loaded.title)
            self.exportError = nil
            self.recentProjects = (try? core.getRecentProjects(limit: 12)) ?? []
            self.previewReloadToken = UUID()
            self.refreshDerivedProjectState()
        } catch {
            self.exportError = "Failed to open project: \(error.localizedDescription)"
        }
    }

    func saveProject() {
        do {
            let res = try core.saveProject(project, targetPath: projectFilePath)
            if res.success {
                self.projectFilePath = res.filePath
                self.isDirty = false
                self.recentProjects = (try? core.getRecentProjects(limit: 12)) ?? []
            }
        } catch {
            self.exportError = "Failed to save project: \(error.localizedDescription)"
        }
    }

    func setProjectTitle(_ title: String) {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        project.title = trimmed
        outputFilename = Self.slugify(trimmed)
        exportSettings.filename = outputFilename
        isDirty = true
    }

    func selectEntryHtml(_ entryPath: String) {
        guard let asset = project.assets[entryPath], let content = asset.content else { return }
        project.entryHtmlPath = entryPath
        project.htmlContent = content
        isDirty = true
        previewReloadToken = UUID()
        refreshDerivedProjectState()
    }

    func updateHtmlContent(_ newHtml: String) {
        project.htmlContent = newHtml
        if let synced = try? core.syncRenderHtml(newHtml) {
            project.renderHtmlPath = synced.renderHtmlPath
        }
        isDirty = true
        previewReloadToken = UUID()
        refreshDerivedProjectState()
    }

    // MARK: - Audio Track

    func selectAudioFileDialog() {
        let panel = NSOpenPanel()
        panel.title = "Attach Soundtrack Audio"
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = false
        panel.allowedContentTypes = [.mp3, .wav, .mpeg4Audio, .aiff, .audio]
        if panel.runModal() == .OK, let url = panel.url {
            self.audioFilePath = url.path
            self.audioSettings.sourceMode = "external"
            self.audioSettings.fileName = url.lastPathComponent
            self.isDirty = true
            self.audioPlayer = try? AVAudioPlayer(contentsOf: url)
            self.audioPlayer?.prepareToPlay()
            if let dur = self.audioPlayer?.duration {
                self.audioSettings.durationSeconds = dur
            }
        }
    }

    func clearAudio() {
        audioPlayer?.stop()
        audioPlayer = nil
        audioFilePath = nil
        audioSettings.sourceMode = "none"
        audioSettings.fileName = nil
        isDirty = true
    }

    // MARK: - Playback & Scrubbing

    func togglePlay() {
        if isPlaying {
            pausePlayback()
        } else {
            startPlayback()
        }
    }

    func startPlayback() {
        guard !isPlaying else { return }
        isPlaying = true
        lastTickDate = Date()
        syncAudioPlayback()

        playbackTimer?.invalidate()
        playbackTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.onPlaybackTick()
            }
        }
    }

    func pausePlayback() {
        isPlaying = false
        playbackTimer?.invalidate()
        playbackTimer = nil
        audioPlayer?.pause()
    }

    func stopPlayback() {
        pausePlayback()
        currentTime = 0
        audioPlayer?.currentTime = 0
    }

    func restartPlayback() {
        currentTime = 0
        previewReloadToken = UUID()
        startPlayback()
    }

    func seek(to target: Double) {
        let dur = max(0.1, exportSettings.durationSeconds)
        currentTime = min(max(0.0, target), dur)
        syncAudioPosition()
    }

    func stepFrame(forward: Bool, shift: Bool = false) {
        pausePlayback()
        let dt = shift ? 1.0 : (1.0 / Double(max(1, exportSettings.fps)))
        seek(to: forward ? currentTime + dt : currentTime - dt)
    }

    func addMarkerAtPlayhead() {
        let rounded = (currentTime * 100).rounded() / 100
        if !markers.contains(where: { abs($0 - rounded) < 0.02 }) {
            markers.append(rounded)
            markers.sort()
        }
    }

    func removeMarker(_ marker: Double) {
        markers.removeAll { abs($0 - marker) < 0.02 }
    }

    private func onPlaybackTick() {
        guard isPlaying else { return }
        let now = Date()
        let dt = now.timeIntervalSince(lastTickDate)
        lastTickDate = now

        let dur = max(0.1, exportSettings.durationSeconds)
        var next = currentTime + dt
        if next >= dur {
            if exportSettings.loopAnimationIfShorter {
                next = 0
            } else {
                next = dur
                pausePlayback()
            }
        }
        currentTime = next
        syncAudioPlayback()
    }

    private func syncAudioPosition() {
        guard let player = audioPlayer else { return }
        let offset = audioSettings.startOffsetSeconds
        let trimIn = audioSettings.trimInSeconds
        player.volume = Float(min(1.0, max(0.0, audioSettings.volume)))
        if currentTime < offset {
            player.pause()
        } else {
            player.currentTime = max(0, currentTime - offset + trimIn)
        }
    }

    private func syncAudioPlayback() {
        guard let player = audioPlayer else { return }
        player.volume = Float(min(1.0, max(0.0, audioSettings.volume)))
        let offset = audioSettings.startOffsetSeconds
        let trimIn = audioSettings.trimInSeconds
        if !isPlaying || currentTime < offset {
            if player.isPlaying { player.pause() }
        } else {
            let expected = max(0, currentTime - offset + trimIn)
            if !player.isPlaying {
                player.currentTime = expected
                player.play()
            } else if abs(player.currentTime - expected) > 0.25 {
                player.currentTime = expected
            }
        }
    }

    // MARK: - Native Rust Export Pipeline

    func selectSaveDestinationDialog() {
        let panel = NSSavePanel()
        panel.title = "Choose Video Export Destination"
        panel.nameFieldStringValue = "\(outputFilename).\(exportSettings.format)"
        if panel.runModal() == .OK, let url = panel.url {
            outputDirectory = url.deletingLastPathComponent().path
            outputFilename = url.deletingPathExtension().lastPathComponent
        }
    }

    func startExport() {
        guard !isExporting else { return }
        pausePlayback()

        var exportProject = project
        if let synced = try? core.syncRenderHtml(project.htmlContent) {
            exportProject.renderHtmlPath = synced.renderHtmlPath
            project.renderHtmlPath = synced.renderHtmlPath
        }

        let cleanName = outputFilename.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? "desktop-export"
            : outputFilename.trimmingCharacters(in: .whitespacesAndNewlines)
        let outPath = URL(fileURLWithPath: outputDirectory)
            .appendingPathComponent("\(cleanName).\(exportSettings.format)")
            .path

        let totalFrames = max(1, Int((exportSettings.durationSeconds * Double(exportSettings.fps)).rounded()))
        let jobId = "job-\(Int(Date().timeIntervalSince1970 * 1000))"

        let config = DesktopExportJobConfig(
            jobId: jobId,
            project: exportProject,
            settings: exportSettings,
            audioSettings: audioSettings,
            audioFilePath: audioFilePath,
            outputFilePath: outPath,
            strategy: exportStrategy
        )

        isExporting = true
        exportError = nil
        exportResult = nil
        exportProgress = DesktopExportProgress(
            jobId: jobId,
            status: "validating",
            currentFrame: 0,
            totalFrames: totalFrames,
            percentage: 0,
            elapsedMs: 0,
            estimatedRemainingMs: 0,
            currentFps: 0,
            message: "Starting native Rust + Chromium CDP pipeline...",
            error: nil
        )

        let coreClient = self.core
        let progressCallback: @Sendable (DesktopExportProgress) -> Void = { [weak self] progress in
            Task { @MainActor in
                self?.exportProgress = progress
            }
        }
        Task.detached(priority: .userInitiated) {
            do {
                let outcome = try coreClient.startExport(config: config, onProgress: progressCallback)
                await MainActor.run {
                    self.isExporting = false
                    self.exportResult = outcome
                }
            } catch {
                await MainActor.run {
                    self.isExporting = false
                    self.exportError = error.localizedDescription
                }
            }
        }
    }

    func cancelExport() {
        core.cancelExport()
    }

    func openExportedVideo() {
        guard let path = exportResult?.outputFilePath else { return }
        try? core.openPath(path)
    }

    func showExportedInFinder() {
        guard let path = exportResult?.outputFilePath else { return }
        try? core.showItemInFolder(path)
    }
}
