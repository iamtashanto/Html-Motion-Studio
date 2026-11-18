import SwiftUI
import AppKit

@main
struct HTMLMotionStudioApp: App {
    @StateObject private var store = StudioStore()

    init() {
        NSApplication.shared.setActivationPolicy(.regular)
        NSApplication.shared.activate(ignoringOtherApps: true)
    }

    var body: some Scene {
        WindowGroup("HTML Motion Studio Pro") {
            MainStudioView(store: store)
                .frame(minWidth: 1100, minHeight: 700)
                .preferredColorScheme(.dark)
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 1440, height: 880)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Motion Project...") {
                    store.showNewProjectSheet = true
                }
                .keyboardShortcut("n", modifiers: .command)

                Button("Open HTML / ZIP / Project...") {
                    store.openProjectFileDialog()
                }
                .keyboardShortcut("o", modifiers: .command)

                Button("Open Project Folder...") {
                    store.openProjectFolderDialog()
                }
                .keyboardShortcut("o", modifiers: [.command, .shift])

                Divider()

                Button("Save Project") {
                    store.saveProject()
                }
                .keyboardShortcut("s", modifiers: .command)

                Button("Export Video...") {
                    store.startExport()
                }
                .keyboardShortcut("e", modifiers: .command)
            }

            CommandMenu("Playback") {
                Button(store.isPlaying ? "Pause" : "Play") {
                    store.togglePlay()
                }
                .keyboardShortcut(.space, modifiers: [])

                Button("Rewind to Start") {
                    store.seek(to: 0)
                }
                .keyboardShortcut("0", modifiers: [])

                Button("Step Back 1 Frame") {
                    store.stepFrame(forward: false)
                }
                .keyboardShortcut(.leftArrow, modifiers: [])

                Button("Step Forward 1 Frame") {
                    store.stepFrame(forward: true)
                }
                .keyboardShortcut(.rightArrow, modifiers: [])

                Divider()

                Button("Add Marker at Playhead") {
                    store.addMarkerAtPlayhead()
                }
                .keyboardShortcut("m", modifiers: [])
            }

            CommandMenu("Studio") {
                Button("Toggle Assets Sidebar") {
                    store.showLeftSidebar.toggle()
                }
                .keyboardShortcut("b", modifiers: .command)

                Button("Toggle Properties Inspector") {
                    store.showRightPanel.toggle()
                }
                .keyboardShortcut("b", modifiers: [.command, .shift])

                Button("Toggle Master Timeline") {
                    store.showTimeline.toggle()
                }
                .keyboardShortcut("j", modifiers: .command)

                Divider()

                Button("Open Motion Code Editor") {
                    store.showCodeEditorSheet = true
                }
                .keyboardShortcut("k", modifiers: [.command, .shift])
            }
        }
    }
}
