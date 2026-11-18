import SwiftUI
import WebKit

/// Native macOS WKWebView host that renders the HTML5/CSS/Canvas/WebGL animation live
/// and synchronizes deterministic seek timestamps via `window.__HMS_SEEK__(t, isPlaying)`.
struct MotionWebView: NSViewRepresentable {
    let html: String
    let reloadToken: UUID
    let currentTime: Double
    let isPlaying: Bool

    final class Coordinator: NSObject, WKNavigationDelegate {
        var lastLoadedToken: UUID?
        var lastSeekTime: Double = -1
        var lastPlayingState: Bool = false
        var isLoaded: Bool = false

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            isLoaded = true
            let js = "if (window.__HMS_SEEK__) { window.__HMS_SEEK__(\(lastSeekTime < 0 ? 0 : lastSeekTime), \(lastPlayingState ? "true" : "false")); }"
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.setValue(false, forKey: "drawsBackground")
        context.coordinator.lastLoadedToken = reloadToken
        webView.loadHTMLString(html, baseURL: nil)
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        let coord = context.coordinator
        if coord.lastLoadedToken != reloadToken {
            coord.lastLoadedToken = reloadToken
            coord.isLoaded = false
            coord.lastSeekTime = currentTime
            coord.lastPlayingState = isPlaying
            webView.loadHTMLString(html, baseURL: nil)
            return
        }

        let timeChanged = abs(currentTime - coord.lastSeekTime) > 0.008
        let playChanged = isPlaying != coord.lastPlayingState
        if coord.isLoaded && (timeChanged || playChanged) {
            coord.lastSeekTime = currentTime
            coord.lastPlayingState = isPlaying
            let js = "if (window.__HMS_SEEK__) { window.__HMS_SEEK__(\(currentTime), \(isPlaying ? "true" : "false")); }"
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}

struct PreviewStageView: View {
    @ObservedObject var store: StudioStore

    var body: some View {
        VStack(spacing: 0) {
            // Top Preview Controls Bar
            HStack {
                HStack(spacing: 8) {
                    Text("\(store.exportSettings.width)×\(store.exportSettings.height)")
                        .font(.system(size: 11, weight: .semibold, design: .monospaced))
                        .foregroundColor(StudioTheme.textPrimary)
                    Text(store.exportSettings.aspectRatio)
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(StudioTheme.textSecondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(StudioTheme.surfaceCard)
                        .cornerRadius(4)
                    Text("\(store.exportSettings.fps) FPS")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(StudioTheme.textSecondary)
                }

                Spacer()

                HStack(spacing: 10) {
                    // Zoom Switcher
                    HStack(spacing: 2) {
                        ForEach(PreviewZoom.allCases) { z in
                            Button(z.rawValue) {
                                store.previewZoom = z
                            }
                            .font(.system(size: 10, weight: store.previewZoom == z ? .bold : .medium))
                            .foregroundColor(store.previewZoom == z ? .white : StudioTheme.textSecondary)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 3)
                            .background(store.previewZoom == z ? StudioTheme.accentBlue : Color.clear)
                            .cornerRadius(5)
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(2)
                    .background(StudioTheme.surfaceCard)
                    .cornerRadius(7)
                    .overlay(RoundedRectangle(cornerRadius: 7).stroke(StudioTheme.border, lineWidth: 1))

                    // Background Switcher
                    HStack(spacing: 2) {
                        bgBtn(.dark, icon: "moon.fill")
                        bgBtn(.grid, icon: "grid")
                        bgBtn(.checker, icon: "checkerboard.rectangle")
                        bgBtn(.light, icon: "sun.max.fill")
                    }
                    .padding(2)
                    .background(StudioTheme.surfaceCard)
                    .cornerRadius(7)
                    .overlay(RoundedRectangle(cornerRadius: 7).stroke(StudioTheme.border, lineWidth: 1))
                }
            }
            .padding(.horizontal, 14)
            .frame(height: 38)
            .background(StudioTheme.surfaceDark.opacity(0.9))
            .overlay(alignment: .bottom) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }

            // Main Stage Viewport
            GeometryReader { geo in
                let targetRatio = CGFloat(max(1, store.exportSettings.width)) / CGFloat(max(1, store.exportSettings.height))
                let availW = max(160, geo.size.width - 48)
                let availH = max(120, geo.size.height - 48)
                let stageRatio = availW / availH
                let baseW: CGFloat = stageRatio > targetRatio ? availH * targetRatio : availW
                let baseH: CGFloat = stageRatio > targetRatio ? availH : availW / targetRatio

                let scaleFactor: CGFloat = switch store.previewZoom {
                case .fit: 1.0
                case .p50: 0.5
                case .p75: 0.75
                case .p100: min(1.0, CGFloat(store.exportSettings.width) / max(1, baseW))
                }

                let frameW = baseW * scaleFactor
                let frameH = baseH * scaleFactor

                ZStack {
                    stageBackgroundView

                    MotionWebView(
                        html: store.injectedPreviewHtml,
                        reloadToken: store.previewReloadToken,
                        currentTime: store.currentTime,
                        isPlaying: store.isPlaying
                    )
                    .frame(width: frameW, height: frameH)
                    .background(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(Color.white.opacity(0.14), lineWidth: 1.5)
                    )
                    .shadow(color: .black.opacity(0.55), radius: 22, y: 8)
                }
                .frame(width: geo.size.width, height: geo.size.height)
            }

            // Bottom Transport Bar
            HStack {
                HStack(spacing: 8) {
                    Button {
                        store.togglePlay()
                    } label: {
                        Image(systemName: store.isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 13))
                            .foregroundColor(.white)
                            .frame(width: 32, height: 30)
                            .background(StudioTheme.accentBlue)
                            .cornerRadius(9)
                    }
                    .buttonStyle(.plain)
                    .help("Play / Pause (Space)")

                    Button {
                        store.stopPlayback()
                    } label: {
                        Image(systemName: "stop.fill")
                            .font(.system(size: 11))
                            .foregroundColor(StudioTheme.textSecondary)
                            .frame(width: 28, height: 28)
                            .background(StudioTheme.surfaceCard)
                            .cornerRadius(7)
                    }
                    .buttonStyle(.plain)
                    .help("Stop & Rewind to 0s")

                    Button {
                        store.restartPlayback()
                    } label: {
                        Image(systemName: "arrow.counterclockwise")
                            .font(.system(size: 11))
                            .foregroundColor(StudioTheme.textSecondary)
                            .frame(width: 28, height: 28)
                            .background(StudioTheme.surfaceCard)
                            .cornerRadius(7)
                    }
                    .buttonStyle(.plain)
                    .help("Restart from 0s")
                }

                Spacer()

                HStack(spacing: 4) {
                    Text(String(format: "%.2fs", store.currentTime))
                        .foregroundColor(Color(red: 0.376, green: 0.647, blue: 0.980))
                    Text("/")
                        .foregroundColor(StudioTheme.textSecondary.opacity(0.6))
                    Text(String(format: "%.2fs", store.exportSettings.durationSeconds))
                        .foregroundColor(StudioTheme.textSecondary)
                }
                .font(.system(size: 12, weight: .bold, design: .monospaced))
            }
            .padding(.horizontal, 16)
            .frame(height: 44)
            .background(StudioTheme.surfaceDark.opacity(0.95))
            .overlay(alignment: .top) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }
        }
        .background(StudioTheme.canvasBg)
    }

    @ViewBuilder
    private var stageBackgroundView: some View {
        switch store.previewBackground {
        case .dark:
            StudioTheme.canvasBg
        case .light:
            Color(red: 0.886, green: 0.910, blue: 0.941)
        case .grid:
            Canvas { ctx, size in
                ctx.fill(Path(CGRect(origin: .zero, size: size)), with: .color(StudioTheme.canvasBg))
                let step: CGFloat = 18
                for x in stride(from: 0, to: size.width, by: step) {
                    for y in stride(from: 0, to: size.height, by: step) {
                        ctx.fill(Path(ellipseIn: CGRect(x: x, y: y, width: 1.5, height: 1.5)), with: .color(StudioTheme.border))
                    }
                }
            }
        case .checker:
            Canvas { ctx, size in
                let tile: CGFloat = 16
                for row in 0...Int(size.height / tile) {
                    for col in 0...Int(size.width / tile) {
                        let even = (row + col) % 2 == 0
                        let rect = CGRect(x: CGFloat(col) * tile, y: CGFloat(row) * tile, width: tile, height: tile)
                        ctx.fill(Path(rect), with: .color(even ? StudioTheme.surfaceCard : StudioTheme.border))
                    }
                }
            }
        }
    }

    private func bgBtn(_ bg: PreviewBackground, icon: String) -> some View {
        Button {
            store.previewBackground = bg
        } label: {
            Image(systemName: icon)
                .font(.system(size: 10))
                .foregroundColor(store.previewBackground == bg ? .white : StudioTheme.textSecondary)
                .frame(width: 24, height: 20)
                .background(store.previewBackground == bg ? StudioTheme.border : Color.clear)
                .cornerRadius(5)
        }
        .buttonStyle(.plain)
        .help("\(bg.rawValue) Stage Background")
    }
}
