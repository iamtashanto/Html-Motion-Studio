import SwiftUI

struct AssetsSidebarView: View {
    @ObservedObject var store: StudioStore
    @State private var showHtml = true
    @State private var showCss = true
    @State private var showJs = true
    @State private var showImages = false
    @State private var showAudio = true

    private var allAssets: [ProjectAsset] {
        Array(store.project.assets.values).sorted { $0.name < $1.name }
    }
    private var cssAssets: [ProjectAsset] { allAssets.filter { $0.type == "text/css" } }
    private var jsAssets: [ProjectAsset] { allAssets.filter { $0.type.contains("javascript") } }
    private var imgAssets: [ProjectAsset] { allAssets.filter { $0.type.hasPrefix("image/") } }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Label("Project Assets", systemImage: "folder.fill")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(StudioTheme.textPrimary)
                Spacer()
                Text("\(allAssets.count) files")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(StudioTheme.textSecondary)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(StudioTheme.surfaceCard)
                    .cornerRadius(5)
            }
            .padding(12)
            .overlay(alignment: .bottom) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    // Compatibility Status Card
                    if let report = store.compatibilityReport {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 6) {
                                Image(systemName: report.overallStatus == "ready" ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                                    .font(.system(size: 11))
                                    .foregroundColor(report.overallStatus == "ready" ? StudioTheme.accentEmerald : StudioTheme.accentAmber)
                                Text(report.overallStatus.uppercased())
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(report.overallStatus == "ready" ? StudioTheme.accentEmerald : StudioTheme.accentAmber)
                            }
                            Text(report.summary)
                                .font(.system(size: 10))
                                .foregroundColor(StudioTheme.textSecondary)
                                .lineLimit(2)
                        }
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(StudioTheme.surfaceCard)
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(StudioTheme.border, lineWidth: 1)
                        )
                    }

                    // Entry HTML Files
                    DisclosureGroup(isExpanded: $showHtml) {
                        VStack(spacing: 4) {
                            ForEach(store.project.availableHtmlFiles, id: \.self) { htmlFile in
                                let selected = store.project.entryHtmlPath == htmlFile
                                HStack {
                                    Image(systemName: "doc.text.fill")
                                        .font(.system(size: 11))
                                        .foregroundColor(StudioTheme.accentBlue)
                                    Text(htmlFile)
                                        .font(.system(size: 11, weight: selected ? .semibold : .regular))
                                        .foregroundColor(selected ? Color(red: 0.576, green: 0.773, blue: 0.992) : StudioTheme.textSecondary)
                                        .lineLimit(1)
                                    Spacer()
                                    if selected {
                                        Text("ACTIVE")
                                            .font(.system(size: 8, weight: .black))
                                            .foregroundColor(StudioTheme.accentBlue)
                                    }
                                    Button {
                                        store.showCodeEditorSheet = true
                                    } label: {
                                        Image(systemName: "chevron.left.forwardslash.chevron.right")
                                            .font(.system(size: 10))
                                            .foregroundColor(StudioTheme.accentCyan)
                                    }
                                    .buttonStyle(.plain)
                                }
                                .padding(.horizontal, 8)
                                .padding(.vertical, 6)
                                .background(selected ? StudioTheme.accentBlue.opacity(0.18) : StudioTheme.surfaceCard.opacity(0.5))
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(selected ? StudioTheme.accentBlue.opacity(0.45) : Color.clear, lineWidth: 1)
                                )
                                .onTapGesture {
                                    store.selectEntryHtml(htmlFile)
                                }
                            }
                        }
                        .padding(.top, 4)
                    } label: {
                        Text("ENTRY HTML (\(store.project.availableHtmlFiles.count))")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(StudioTheme.textSecondary)
                    }

                    if !cssAssets.isEmpty {
                        assetSection(title: "STYLESHEETS", icon: "paintbrush.fill", color: StudioTheme.accentCyan, items: cssAssets, isExpanded: $showCss)
                    }
                    if !jsAssets.isEmpty {
                        assetSection(title: "SCRIPTS", icon: "bolt.fill", color: StudioTheme.accentAmber, items: jsAssets, isExpanded: $showJs)
                    }
                    if !imgAssets.isEmpty {
                        assetSection(title: "IMAGES & SVG", icon: "photo.fill", color: StudioTheme.accentEmerald, items: imgAssets, isExpanded: $showImages)
                    }

                    // Soundtrack Audio
                    DisclosureGroup(isExpanded: $showAudio) {
                        VStack(spacing: 8) {
                            if let audioPath = store.audioFilePath {
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack {
                                        Image(systemName: "music.note")
                                            .foregroundColor(StudioTheme.accentPurple)
                                        Text(store.audioSettings.fileName ?? "Soundtrack")
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundColor(Color(red: 0.914, green: 0.835, blue: 1.0))
                                            .lineLimit(1)
                                        Spacer()
                                        Button("Remove") {
                                            store.clearAudio()
                                        }
                                        .font(.system(size: 10, weight: .semibold))
                                        .foregroundColor(.red)
                                        .buttonStyle(.plain)
                                    }
                                    Text(audioPath)
                                        .font(.system(size: 9, design: .monospaced))
                                        .foregroundColor(StudioTheme.textSecondary)
                                        .lineLimit(1)
                                        .truncationMode(.middle)
                                }
                                .padding(10)
                                .background(StudioTheme.accentPurple.opacity(0.16))
                                .cornerRadius(10)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(StudioTheme.accentPurple.opacity(0.35), lineWidth: 1)
                                )
                            } else {
                                Button {
                                    store.selectAudioFileDialog()
                                } label: {
                                    HStack {
                                        Image(systemName: "plus")
                                        Text("Attach Audio Track")
                                    }
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(StudioTheme.textSecondary)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 9)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4]))
                                            .foregroundColor(StudioTheme.border)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.top, 6)
                    } label: {
                        Text("SOUNDTRACK AUDIO")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(StudioTheme.textSecondary)
                    }
                }
                .padding(12)
            }
        }
        .frame(width: 256)
        .background(StudioTheme.surfaceDark)
        .overlay(alignment: .trailing) {
            Rectangle().fill(StudioTheme.border).frame(width: 1)
        }
    }

    private func assetSection(
        title: String,
        icon: String,
        color: Color,
        items: [ProjectAsset],
        isExpanded: Binding<Bool>
    ) -> some View {
        DisclosureGroup(isExpanded: isExpanded) {
            VStack(spacing: 4) {
                ForEach(items) { asset in
                    HStack {
                        Image(systemName: icon)
                            .font(.system(size: 10))
                            .foregroundColor(color)
                        Text(asset.name)
                            .font(.system(size: 11))
                            .foregroundColor(StudioTheme.textPrimary)
                            .lineLimit(1)
                        Spacer()
                        Text(String(format: "%.1fk", Double(asset.size) / 1024.0))
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundColor(StudioTheme.textSecondary)
                    }
                    .padding(.vertical, 3)
                }
            }
            .padding(.top, 4)
        } label: {
            Text("\(title) (\(items.count))")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(StudioTheme.textSecondary)
        }
    }
}
