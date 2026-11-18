import SwiftUI

struct PropertiesInspectorView: View {
    @ObservedObject var store: StudioStore
    @State private var activeTab: Int = 0 // 0 Export, 1 Engine, 2 Audio

    private let resolutionPresets: [(label: String, res: String, w: Int, h: Int)] = [
        ("1080p Full HD", "1080p", 1920, 1080),
        ("4K Ultra HD", "4k", 3840, 2160),
        ("720p HD", "720p", 1280, 720),
        ("1440p 2K", "1440p", 2560, 1440)
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Segmented Tabs
            HStack(spacing: 4) {
                tabButton(title: "Export", icon: "film", index: 0)
                tabButton(title: "Engine", icon: "cpu", index: 1)
                tabButton(title: "Audio", icon: "music.note", index: 2)
            }
            .padding(8)
            .background(StudioTheme.surfaceCard.opacity(0.6))
            .overlay(alignment: .bottom) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if activeTab == 0 {
                        exportTabContent
                    } else if activeTab == 1 {
                        engineTabContent
                    } else {
                        audioTabContent
                    }
                }
                .padding(14)
            }

            // Bottom Primary Render CTA
            VStack {
                Button {
                    store.startExport()
                } label: {
                    Label("Render \(store.exportSettings.format.uppercased()) Video", systemImage: "arrow.down.circle.fill")
                        .font(.system(size: 12, weight: .heavy))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            LinearGradient(
                                colors: [StudioTheme.accentBlue, StudioTheme.accentIndigo, StudioTheme.accentCyan],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(11)
                }
                .buttonStyle(.plain)
                .disabled(store.isExporting)
            }
            .padding(14)
            .overlay(alignment: .top) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }
        }
        .frame(width: 312)
        .background(StudioTheme.surfaceDark)
        .overlay(alignment: .leading) {
            Rectangle().fill(StudioTheme.border).frame(width: 1)
        }
    }

    private var exportTabContent: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Resolution Preset")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(StudioTheme.textPrimary)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    ForEach(resolutionPresets, id: \.res) { preset in
                        let selected = store.exportSettings.width == preset.w && store.exportSettings.height == preset.h
                        Button {
                            store.exportSettings.resolution = preset.res
                            store.exportSettings.width = preset.w
                            store.exportSettings.height = preset.h
                        } label: {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(preset.label)
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(StudioTheme.textPrimary)
                                Text("\(preset.w)×\(preset.h)")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(StudioTheme.textSecondary)
                            }
                            .padding(9)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(selected ? StudioTheme.accentBlue.opacity(0.22) : StudioTheme.surfaceCard)
                            .cornerRadius(10)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(selected ? StudioTheme.accentBlue : StudioTheme.border, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Frame Rate")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Picker("", selection: $store.exportSettings.fps) {
                        Text("60 FPS").tag(60)
                        Text("30 FPS").tag(30)
                        Text("24 FPS").tag(24)
                    }
                    .labelsHidden()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Format")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Picker("", selection: $store.exportSettings.format) {
                        Text("MP4 (H.264)").tag("mp4")
                        Text("WebM (VP9)").tag("webm")
                        Text("ProRes (.mov)").tag("mov")
                    }
                    .labelsHidden()
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                let totalFrames = Int((store.exportSettings.durationSeconds * Double(store.exportSettings.fps)).rounded())
                HStack {
                    Text("Duration")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Spacer()
                    Text("\(String(format: "%.1fs", store.exportSettings.durationSeconds)) (\(totalFrames) frames)")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(red: 0.376, green: 0.647, blue: 0.980))
                }
                Slider(value: $store.exportSettings.durationSeconds, in: 1...60, step: 0.5)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Save Destination")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(StudioTheme.textPrimary)
                HStack(spacing: 6) {
                    TextField("Filename", text: $store.outputFilename)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(size: 11, design: .monospaced))
                    Button {
                        store.selectSaveDestinationDialog()
                    } label: {
                        Image(systemName: "folder")
                            .padding(6)
                            .background(StudioTheme.surfaceCard)
                            .cornerRadius(7)
                    }
                    .buttonStyle(.plain)
                }
                Text("\(store.outputDirectory)/\(store.outputFilename).\(store.exportSettings.format)")
                    .font(.system(size: 9, design: .monospaced))
                    .foregroundColor(StudioTheme.textSecondary)
                    .lineLimit(2)
                    .truncationMode(.middle)
            }
        }
    }

    private var engineTabContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Rendering Engine Pipeline")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(StudioTheme.textPrimary)

            strategyCard(
                id: "adapter",
                title: "Strategy A: Deterministic Adapter",
                subtitle: "Evaluates window.__HTML_MOTION_STUDIO__ for exact frame-accurate GSAP, Three.js, and Canvas drawing.",
                accent: StudioTheme.accentIndigo
            )

            strategyCard(
                id: "compatibility",
                title: "Strategy B: Compatibility CDP Capture",
                subtitle: "Controlled headless Chromium capture via Rust CDP streamed directly into FFmpeg stdin (zero temp disk PNGs).",
                accent: StudioTheme.accentBlue
            )

            if let report = store.compatibilityReport {
                Divider().overlay(StudioTheme.border)
                Text("Compatibility Checks")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(StudioTheme.textPrimary)

                ForEach(report.checks) { check in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: check.status == "error" ? "xmark.circle.fill" : check.status == "warning" ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                            .font(.system(size: 11))
                            .foregroundColor(check.status == "error" ? .red : check.status == "warning" ? StudioTheme.accentAmber : StudioTheme.accentEmerald)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(check.name)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(StudioTheme.textPrimary)
                            Text(check.details)
                                .font(.system(size: 10))
                                .foregroundColor(StudioTheme.textSecondary)
                        }
                    }
                }
            }
        }
    }

    private var audioTabContent: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Master Volume")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Spacer()
                    Text("\(Int((store.audioSettings.volume * 100).rounded()))%")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(StudioTheme.accentPurple)
                }
                Slider(value: $store.audioSettings.volume, in: 0...2, step: 0.05)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Fade In")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Spacer()
                    Text(String(format: "%.1fs", store.audioSettings.fadeInSeconds))
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(StudioTheme.textSecondary)
                }
                Slider(value: $store.audioSettings.fadeInSeconds, in: 0...5, step: 0.1)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Fade Out")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Spacer()
                    Text(String(format: "%.1fs", store.audioSettings.fadeOutSeconds))
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(StudioTheme.textSecondary)
                }
                Slider(value: $store.audioSettings.fadeOutSeconds, in: 0...5, step: 0.1)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Start Delay Offset")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(StudioTheme.textPrimary)
                    Spacer()
                    Text(String(format: "%.1fs", store.audioSettings.startOffsetSeconds))
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(StudioTheme.textSecondary)
                }
                Slider(value: $store.audioSettings.startOffsetSeconds, in: 0...max(1, store.exportSettings.durationSeconds), step: 0.1)
            }
        }
    }

    private func strategyCard(id: String, title: String, subtitle: String, accent: Color) -> some View {
        let selected = store.exportStrategy == id
        return Button {
            store.exportStrategy = id
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(title)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(selected ? .white : StudioTheme.textPrimary)
                    Spacer()
                    if selected {
                        Text("SELECTED")
                            .font(.system(size: 8, weight: .black))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(accent)
                            .foregroundColor(.white)
                            .cornerRadius(4)
                    }
                }
                Text(subtitle)
                    .font(.system(size: 10))
                    .foregroundColor(StudioTheme.textSecondary)
                    .multilineTextAlignment(.leading)
            }
            .padding(11)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(selected ? accent.opacity(0.18) : StudioTheme.surfaceCard)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(selected ? accent : StudioTheme.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func tabButton(title: String, icon: String, index: Int) -> some View {
        let active = activeTab == index
        return Button {
            activeTab = index
        } label: {
            Label(title, systemImage: icon)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(active ? .white : StudioTheme.textSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(active ? StudioTheme.accentBlue : Color.clear)
                .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}
