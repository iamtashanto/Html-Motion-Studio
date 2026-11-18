import SwiftUI

struct ExportProgressOverlay: View {
    @ObservedObject var store: StudioStore

    var body: some View {
        if store.isExporting, let prog = store.exportProgress {
            ZStack {
                Color.black.opacity(0.72).ignoresSafeArea()
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Native Rust Rendering Pipeline")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.white)
                            Text("Chromium CDP frame stepping -> FFmpeg stdin pipe")
                                .font(.system(size: 11))
                                .foregroundColor(StudioTheme.textSecondary)
                        }
                        Spacer()
                        Button("Cancel", role: .destructive) {
                            store.cancelExport()
                        }
                        .buttonStyle(.bordered)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        HStack(alignment: .firstTextBaseline) {
                            Text("\(prog.percentage)%")
                                .font(.system(size: 26, weight: .black, design: .monospaced))
                                .foregroundColor(Color(red: 0.376, green: 0.647, blue: 0.980))
                            Spacer()
                            Text(prog.message)
                                .font(.system(size: 11))
                                .foregroundColor(StudioTheme.textSecondary)
                                .lineLimit(1)
                        }
                        ProgressView(value: Double(prog.percentage), total: 100.0)
                            .tint(StudioTheme.accentBlue)
                    }

                    HStack(spacing: 12) {
                        metricBox(label: "Frames", value: "\(prog.currentFrame) / \(prog.totalFrames)")
                        metricBox(label: "Elapsed", value: String(format: "%.1fs", Double(prog.elapsedMs) / 1000.0))
                        metricBox(label: "Speed", value: String(format: "%.1f FPS", prog.currentFps))
                    }
                }
                .padding(22)
                .frame(width: 460)
                .background(StudioTheme.surfaceCard)
                .cornerRadius(18)
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(StudioTheme.border, lineWidth: 1))
                .shadow(radius: 30)
            }
        }
    }

    private func metricBox(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(StudioTheme.textSecondary)
            Text(value)
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundColor(StudioTheme.textPrimary)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(StudioTheme.surfaceDark)
        .cornerRadius(10)
    }
}

struct ExportSuccessOverlay: View {
    @ObservedObject var store: StudioStore

    var body: some View {
        if let outcome = store.exportResult {
            let fileName = URL(fileURLWithPath: outcome.outputFilePath).lastPathComponent
            let sizeMb = String(format: "%.2f MB", Double(outcome.validation.sizeBytes) / (1024.0 * 1024.0))

            ZStack {
                Color.black.opacity(0.75).ignoresSafeArea()
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        HStack(spacing: 10) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 24))
                                .foregroundColor(StudioTheme.accentEmerald)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Video Export Successful!")
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.white)
                                Text("Verified with local FFprobe • Ready for playback")
                                    .font(.system(size: 11))
                                    .foregroundColor(StudioTheme.textSecondary)
                            }
                        }
                        Spacer()
                        Button {
                            store.exportResult = nil
                        } label: {
                            Image(systemName: "xmark")
                                .foregroundColor(StudioTheme.textSecondary)
                        }
                        .buttonStyle(.plain)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text(fileName)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            Spacer()
                            Text("FFprobe Verified")
                                .font(.system(size: 10, weight: .semibold, design: .monospaced))
                                .foregroundColor(StudioTheme.accentEmerald)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 2)
                                .background(StudioTheme.accentEmerald.opacity(0.15))
                                .cornerRadius(5)
                        }

                        Divider().overlay(StudioTheme.border)

                        HStack {
                            statCol("Codec", (outcome.validation.video?.codec ?? "H264").uppercased())
                            Spacer()
                            statCol("Dimensions", "\(outcome.validation.video?.width ?? 0)×\(outcome.validation.video?.height ?? 0)")
                            Spacer()
                            statCol("FPS", "\(outcome.validation.video?.fps ?? 60) fps")
                            Spacer()
                            statCol("File Size", sizeMb)
                        }
                    }
                    .padding(14)
                    .background(StudioTheme.surfaceDark)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(StudioTheme.border, lineWidth: 1))

                    HStack(spacing: 10) {
                        Button {
                            store.openExportedVideo()
                        } label: {
                            Label("Open in Player", systemImage: "play.fill")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(StudioTheme.accentBlue)
                                .cornerRadius(10)
                        }
                        .buttonStyle(.plain)

                        Button {
                            store.showExportedInFinder()
                        } label: {
                            Label("Show in Finder", systemImage: "folder.fill")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(StudioTheme.textPrimary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(StudioTheme.surfaceDark)
                                .cornerRadius(10)
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(StudioTheme.border, lineWidth: 1))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(22)
                .frame(width: 500)
                .background(StudioTheme.surfaceCard)
                .cornerRadius(18)
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(StudioTheme.accentEmerald.opacity(0.4), lineWidth: 1))
                .shadow(radius: 30)
            }
        }
    }

    private func statCol(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.system(size: 10))
                .foregroundColor(StudioTheme.textSecondary)
            Text(value)
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundColor(StudioTheme.textPrimary)
        }
    }
}
