import SwiftUI

struct MainStudioView: View {
    @ObservedObject var store: StudioStore

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                ToolbarView(store: store)

                if let err = store.exportError {
                    HStack {
                        Image(systemName: "exclamationmark.circle.fill")
                            .foregroundColor(.red)
                        Text("Export Notice: \(err)")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(Color(red: 0.996, green: 0.792, blue: 0.792))
                            .lineLimit(2)
                        Spacer()
                        Button {
                            store.exportError = nil
                        } label: {
                            Image(systemName: "xmark")
                                .foregroundColor(.red)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Color.red.opacity(0.22))
                    .overlay(alignment: .bottom) {
                        Rectangle().fill(Color.red.opacity(0.45)).frame(height: 1)
                    }
                }

                HStack(spacing: 0) {
                    if store.showLeftSidebar {
                        AssetsSidebarView(store: store)
                    }

                    VStack(spacing: 0) {
                        PreviewStageView(store: store)
                        if store.showTimeline {
                            TimelineTrackView(store: store)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                    if store.showRightPanel {
                        PropertiesInspectorView(store: store)
                    }
                }
            }
            .background(StudioTheme.canvasBg)

            ExportProgressOverlay(store: store)
            ExportSuccessOverlay(store: store)
        }
        .sheet(isPresented: $store.showNewProjectSheet) {
            NewProjectSheet(store: store)
        }
        .sheet(isPresented: $store.showCodeEditorSheet) {
            CodeEditorSheet(store: store)
        }
    }
}
