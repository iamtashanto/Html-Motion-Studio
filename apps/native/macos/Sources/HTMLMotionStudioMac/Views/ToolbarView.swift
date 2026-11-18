import SwiftUI

struct ToolbarView: View {
    @ObservedObject var store: StudioStore
    @State private var isEditingTitle = false
    @State private var draftTitle = ""

    var body: some View {
        HStack(spacing: 12) {
            // Left: Brand + File & Recents Menus
            HStack(spacing: 10) {
                HStack(spacing: 8) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 9, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [StudioTheme.accentBlue, StudioTheme.accentIndigo],
                                    startPoint: .bottomLeading,
                                    endPoint: .topTrailing
                                )
                            )
                            .frame(width: 28, height: 28)
                        Image(systemName: "film.stack")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.white)
                    }

                    Text("MOTION STUDIO")
                        .font(.system(size: 11, weight: .black, design: .default))
                        .tracking(0.8)
                        .foregroundColor(.white)

                    Text("NATIVE")
                        .font(.system(size: 9, weight: .bold))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(StudioTheme.accentIndigo.opacity(0.22))
                        .foregroundColor(Color(red: 0.647, green: 0.706, blue: 0.988))
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(StudioTheme.accentIndigo.opacity(0.35), lineWidth: 1)
                        )
                        .cornerRadius(4)
                }

                Divider()
                    .frame(height: 20)
                    .overlay(StudioTheme.border)

                Menu {
                    Button {
                        store.showNewProjectSheet = true
                    } label: {
                        Label("New Project...", systemImage: "plus.circle")
                    }
                    Button {
                        store.openProjectFileDialog()
                    } label: {
                        Label("Open HTML / ZIP / .hmsproj...", systemImage: "doc.badge.plus")
                    }
                    Button {
                        store.openProjectFolderDialog()
                    } label: {
                        Label("Open Project Folder...", systemImage: "folder")
                    }
                    Divider()
                    Button {
                        store.saveProject()
                    } label: {
                        Label("Save Project", systemImage: "square.and.arrow.down")
                    }
                } label: {
                    Label("File", systemImage: "doc")
                        .font(.system(size: 11, weight: .medium))
                }
                .menuStyle(.borderlessButton)
                .fixedSize()

                Menu {
                    if store.recentProjects.isEmpty {
                        Text("No recent projects yet")
                    } else {
                        ForEach(store.recentProjects) { item in
                            Button {
                                store.openProject(from: item.filePath)
                            } label: {
                                Text("\(item.title)  —  \(URL(fileURLWithPath: item.filePath).lastPathComponent)")
                            }
                        }
                        Divider()
                        Button(role: .destructive) {
                            try? store.core.clearRecentProjects()
                            store.recentProjects = []
                        } label: {
                            Label("Clear Recent Projects", systemImage: "trash")
                        }
                    }
                } label: {
                    Label("Recent", systemImage: "clock")
                        .font(.system(size: 11, weight: .medium))
                }
                .menuStyle(.borderlessButton)
                .fixedSize()
            }

            Spacer()

            // Center: Editable Project Title + Dirty Pill
            HStack(spacing: 8) {
                if isEditingTitle {
                    TextField("Project Title", text: $draftTitle, onCommit: {
                        store.setProjectTitle(draftTitle)
                        isEditingTitle = false
                    })
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 210)
                    .font(.system(size: 12, weight: .bold))

                    Button {
                        store.setProjectTitle(draftTitle)
                        isEditingTitle = false
                    } label: {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                } else {
                    Button {
                        draftTitle = store.project.title
                        isEditingTitle = true
                    } label: {
                        HStack(spacing: 5) {
                            Text(store.project.title)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(StudioTheme.textPrimary)
                                .lineLimit(1)
                            Image(systemName: "pencil")
                                .font(.system(size: 10))
                                .foregroundColor(StudioTheme.textSecondary)
                        }
                    }
                    .buttonStyle(.plain)
                }

                HStack(spacing: 5) {
                    Circle()
                        .fill(store.isDirty ? StudioTheme.accentAmber : StudioTheme.accentEmerald)
                        .frame(width: 6, height: 6)
                    Text(store.isDirty ? "Unsaved Edits" : "Saved")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(store.isDirty ? StudioTheme.accentAmber : StudioTheme.accentEmerald)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background((store.isDirty ? StudioTheme.accentAmber : StudioTheme.accentEmerald).opacity(0.14))
                .cornerRadius(999)
            }

            Spacer()

            // Right: Panel Toggles + Code Editor + Engine Status + Export CTA
            HStack(spacing: 8) {
                HStack(spacing: 2) {
                    panelToggleBtn(icon: "sidebar.left", active: store.showLeftSidebar, help: "Toggle Assets Sidebar (⌘B)") {
                        store.showLeftSidebar.toggle()
                    }
                    panelToggleBtn(icon: "rectangle.bottomthird.inset.filled", active: store.showTimeline, help: "Toggle Timeline (⌘J)") {
                        store.showTimeline.toggle()
                    }
                    panelToggleBtn(icon: "sidebar.right", active: store.showRightPanel, help: "Toggle Inspector (⌘⇧B)") {
                        store.showRightPanel.toggle()
                    }
                }
                .padding(2)
                .background(StudioTheme.surfaceCard)
                .cornerRadius(8)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(StudioTheme.border, lineWidth: 1))

                Button {
                    store.showCodeEditorSheet = true
                } label: {
                    Label("Code Editor", systemImage: "chevron.left.forwardslash.chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(StudioTheme.accentCyan)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(StudioTheme.surfaceCard)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(StudioTheme.accentCyan.opacity(0.35), lineWidth: 1))
                }
                .buttonStyle(.plain)

                if let caps = store.capabilities {
                    HStack(spacing: 6) {
                        Image(systemName: "cpu")
                            .font(.system(size: 11))
                            .foregroundColor(StudioTheme.accentIndigo)
                        Text(caps.ffmpegAvailable ? "FFmpeg Active" : "FFmpeg Missing")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(StudioTheme.textSecondary)
                        Circle().fill(StudioTheme.border).frame(width: 3, height: 3)
                        Text("Rust Core")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(StudioTheme.accentEmerald)
                    }
                    .padding(.horizontal, 9)
                    .padding(.vertical, 5)
                    .background(StudioTheme.surfaceCard)
                    .cornerRadius(8)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(StudioTheme.border, lineWidth: 1))
                }

                Button {
                    store.startExport()
                } label: {
                    Label("Export \(store.exportSettings.format.uppercased())", systemImage: "arrow.down.circle.fill")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            LinearGradient(
                                colors: [StudioTheme.accentBlue, StudioTheme.accentIndigo],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(9)
                }
                .buttonStyle(.plain)
                .disabled(store.isExporting)
            }
        }
        .padding(.horizontal, 14)
        .frame(height: 50)
        .background(StudioTheme.surfaceDark)
        .overlay(alignment: .bottom) {
            Rectangle().fill(StudioTheme.border).frame(height: 1)
        }
    }

    private func panelToggleBtn(icon: String, active: Bool, help: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(active ? Color(red: 0.376, green: 0.647, blue: 0.980) : StudioTheme.textSecondary)
                .frame(width: 26, height: 22)
                .background(active ? StudioTheme.border : Color.clear)
                .cornerRadius(6)
        }
        .buttonStyle(.plain)
        .help(help)
    }
}
