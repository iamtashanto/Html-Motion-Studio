import SwiftUI

struct TimelineTrackView: View {
    @ObservedObject var store: StudioStore

    private var duration: Double { max(0.1, store.exportSettings.durationSeconds) }
    private var fps: Int { max(1, store.exportSettings.fps) }
    private var progress: Double { min(1.0, max(0.0, store.currentTime / duration)) }

    var body: some View {
        VStack(spacing: 0) {
            // Timeline Header
            HStack(spacing: 12) {
                Label("MASTER TIMELINE", systemImage: "clock")
                    .font(.system(size: 10, weight: .black))
                    .foregroundColor(StudioTheme.textPrimary)

                Button {
                    store.timeInFrames.toggle()
                } label: {
                    Group {
                        if store.timeInFrames {
                            let curF = Int((store.currentTime * Double(fps)).rounded())
                            let totF = Int((duration * Double(fps)).rounded())
                            Text("\(curF)f / \(totF)f (@\(fps)fps)")
                        } else {
                            Text(String(format: "%.2fs / %.2fs", store.currentTime, duration))
                        }
                    }
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(red: 0.376, green: 0.647, blue: 0.980))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(StudioTheme.surfaceDark)
                    .cornerRadius(6)
                    .overlay(RoundedRectangle(cornerRadius: 6).stroke(StudioTheme.border, lineWidth: 1))
                }
                .buttonStyle(.plain)

                HStack(spacing: 2) {
                    Button { store.stepFrame(forward: false) } label: {
                        Image(systemName: "backward.frame.fill")
                            .font(.system(size: 10))
                            .frame(width: 24, height: 22)
                    }
                    .buttonStyle(.plain)
                    .help("Step Back 1 Frame (←)")

                    Button { store.stepFrame(forward: true) } label: {
                        Image(systemName: "forward.frame.fill")
                            .font(.system(size: 10))
                            .frame(width: 24, height: 22)
                    }
                    .buttonStyle(.plain)
                    .help("Step Forward 1 Frame (→)")
                }
                .foregroundColor(StudioTheme.textSecondary)
                .background(StudioTheme.surfaceDark)
                .cornerRadius(6)
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(StudioTheme.border, lineWidth: 1))

                Button {
                    store.addMarkerAtPlayhead()
                } label: {
                    Label("Marker", systemImage: "bookmark.fill")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(StudioTheme.accentAmber)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(StudioTheme.surfaceDark)
                        .cornerRadius(6)
                        .overlay(RoundedRectangle(cornerRadius: 6).stroke(StudioTheme.border, lineWidth: 1))
                }
                .buttonStyle(.plain)

                HStack(spacing: 3) {
                    ForEach([1, 2, 4], id: \.self) { z in
                        Button("\(z)x") { store.timelineZoom = z }
                            .font(.system(size: 9, weight: store.timelineZoom == z ? .bold : .medium, design: .monospaced))
                            .foregroundColor(store.timelineZoom == z ? .white : StudioTheme.textSecondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(store.timelineZoom == z ? StudioTheme.accentBlue : Color.clear)
                            .cornerRadius(4)
                            .buttonStyle(.plain)
                    }
                }
                .padding(2)
                .background(StudioTheme.surfaceDark)
                .cornerRadius(6)
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(StudioTheme.border, lineWidth: 1))

                Spacer()

                if store.audioFilePath != nil {
                    HStack(spacing: 8) {
                        Image(systemName: "speaker.wave.2.fill")
                            .font(.system(size: 10))
                            .foregroundColor(StudioTheme.accentPurple)
                        Slider(value: $store.audioSettings.volume, in: 0...2, step: 0.05)
                            .frame(width: 72)
                        Text("\(Int((store.audioSettings.volume * 100).rounded()))%")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundColor(StudioTheme.textSecondary)
                    }
                }
            }
            .padding(.horizontal, 14)
            .frame(height: 36)
            .background(StudioTheme.surfaceCard.opacity(0.65))
            .overlay(alignment: .bottom) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }

            // Ruler & Tracks
            VStack(spacing: 8) {
                // Interactive Time Ruler + Markers + Red Playhead
                GeometryReader { geo in
                    let w = max(1, geo.size.width)
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(StudioTheme.surfaceCard.opacity(0.75))
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(StudioTheme.border, lineWidth: 1))

                        // Tick marks
                        let tickCount = min(40 * store.timelineZoom, max(6, Int(duration * 2) * store.timelineZoom))
                        ForEach(0...tickCount, id: \.self) { idx in
                            let frac = Double(idx) / Double(max(1, tickCount))
                            let isMajor = idx % max(1, 2 * store.timelineZoom) == 0
                            VStack(spacing: 1) {
                                if isMajor {
                                    Text(store.timeInFrames
                                         ? "\(Int((frac * duration * Double(fps)).rounded()))f"
                                         : String(format: "%.1fs", frac * duration))
                                        .font(.system(size: 8, design: .monospaced))
                                        .foregroundColor(StudioTheme.textSecondary)
                                }
                                Spacer()
                                Rectangle()
                                    .fill(isMajor ? StudioTheme.textSecondary : StudioTheme.border)
                                    .frame(width: 1, height: isMajor ? 8 : 4)
                            }
                            .position(x: w * frac, y: geo.size.height / 2)
                        }

                        // Amber Markers
                        ForEach(store.markers, id: \.self) { markerTime in
                            let frac = min(1.0, max(0.0, markerTime / duration))
                            Rectangle()
                                .fill(StudioTheme.accentAmber)
                                .frame(width: 9, height: 9)
                                .rotationEffect(.degrees(45))
                                .position(x: w * frac, y: 7)
                                .onTapGesture {
                                    store.seek(to: markerTime)
                                }
                                .contextMenu {
                                    Button(role: .destructive) {
                                        store.removeMarker(markerTime)
                                    } label: {
                                        Label("Remove Marker", systemImage: "trash")
                                    }
                                }
                        }

                        // Red Playhead
                        Rectangle()
                            .fill(Color.red)
                            .frame(width: 2, height: geo.size.height)
                            .position(x: w * progress, y: geo.size.height / 2)

                        Circle()
                            .fill(Color.red)
                            .frame(width: 10, height: 10)
                            .position(x: w * progress, y: 4)
                    }
                    .contentShape(Rectangle())
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { value in
                                store.pausePlayback()
                                let frac = min(1.0, max(0.0, value.location.x / w))
                                store.seek(to: frac * duration)
                            }
                    )
                }
                .frame(height: 30)

                // HTML Motion Graphic Video Track
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 7)
                            .fill(StudioTheme.accentBlue.opacity(0.14))
                            .overlay(RoundedRectangle(cornerRadius: 7).stroke(StudioTheme.accentBlue.opacity(0.35), lineWidth: 1))

                        RoundedRectangle(cornerRadius: 7)
                            .fill(StudioTheme.accentBlue.opacity(0.24))
                            .frame(width: max(0, geo.size.width * progress))

                        Text("HTML MOTION GRAPHIC (\(store.exportSettings.width)×\(store.exportSettings.height) @ \(fps)fps • \(String(format: "%.1fs", duration)))")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(Color(red: 0.576, green: 0.773, blue: 0.992))
                            .padding(.horizontal, 10)
                    }
                    .contentShape(Rectangle())
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { value in
                                store.pausePlayback()
                                let frac = min(1.0, max(0.0, value.location.x / max(1, geo.size.width)))
                                store.seek(to: frac * duration)
                            }
                    )
                }
                .frame(height: 26)

                // Audio Soundtrack Track
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 7)
                            .fill(StudioTheme.accentPurple.opacity(0.12))
                            .overlay(RoundedRectangle(cornerRadius: 7).stroke(StudioTheme.accentPurple.opacity(0.32), lineWidth: 1))

                        if let audioName = store.audioSettings.fileName, store.audioFilePath != nil {
                            let offsetFrac = min(0.95, max(0.0, store.audioSettings.startOffsetSeconds / duration))
                            HStack(spacing: 3) {
                                ForEach(0..<42, id: \.self) { idx in
                                    Capsule()
                                        .fill(StudioTheme.accentPurple.opacity(0.45))
                                        .frame(width: 3, height: CGFloat(6 + ((idx * 17) % 14)))
                                }
                            }
                            .padding(.leading, geo.size.width * offsetFrac + 6)

                            Label("AUDIO: \(audioName) (Offset: \(String(format: "%.1fs", store.audioSettings.startOffsetSeconds)))", systemImage: "music.note")
                                .font(.system(size: 10, weight: .bold, design: .monospaced))
                                .foregroundColor(Color(red: 0.847, green: 0.706, blue: 0.996))
                                .padding(.horizontal, 10)
                        } else {
                            Text("No audio track attached (Attach from Assets Sidebar)")
                                .font(.system(size: 10))
                                .italic()
                                .foregroundColor(StudioTheme.textSecondary)
                                .padding(.horizontal, 10)
                        }
                    }
                }
                .frame(height: 26)
            }
            .padding(10)
        }
        .frame(height: 154)
        .background(StudioTheme.surfaceDark)
        .overlay(alignment: .top) {
            Rectangle().fill(StudioTheme.border).frame(height: 1)
        }
    }
}
