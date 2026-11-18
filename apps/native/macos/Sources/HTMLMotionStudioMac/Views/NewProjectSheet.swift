import SwiftUI

struct NewProjectSheet: View {
    @ObservedObject var store: StudioStore
    @Environment(\.dismiss) private var dismiss

    @State private var projectTitle: String = "New Motion Project"
    @State private var selectedTemplateId: String = "2-css-keyframes"

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Create New Motion Project")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    Text("Start from any of the 12 verified native starter suites")
                        .font(.system(size: 11))
                        .foregroundColor(StudioTheme.textSecondary)
                }
                Spacer()
                Button("Close") { dismiss() }
                    .keyboardShortcut(.escape, modifiers: [])
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Project Name")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(StudioTheme.textPrimary)
                TextField("e.g. Social Video Ad 60fps", text: $projectTitle)
                    .textFieldStyle(.roundedBorder)
            }

            Text("Starter Templates (\(store.templates.count) Built-in Suites)")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(StudioTheme.textPrimary)

            ScrollView {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(store.templates) { tmpl in
                        let selected = selectedTemplateId == tmpl.id
                        Button {
                            selectedTemplateId = tmpl.id
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(tmpl.name)
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(StudioTheme.textPrimary)
                                    .lineLimit(1)
                                Text(tmpl.description)
                                    .font(.system(size: 10))
                                    .foregroundColor(StudioTheme.textSecondary)
                                    .lineLimit(2)
                                    .multilineTextAlignment(.leading)
                                Spacer(minLength: 4)
                                Text("\(String(format: "%.0fs", tmpl.defaultDuration)) runtime • \(tmpl.category)")
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(Color(red: 0.376, green: 0.647, blue: 0.980))
                            }
                            .padding(11)
                            .frame(maxWidth: .infinity, minHeight: 82, alignment: .topLeading)
                            .background(selected ? StudioTheme.accentBlue.opacity(0.22) : StudioTheme.surfaceCard)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(selected ? StudioTheme.accentBlue : StudioTheme.border, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            HStack {
                Spacer()
                Button("Cancel") { dismiss() }
                Button("Create Project") {
                    let clean = projectTitle.trimmingCharacters(in: .whitespacesAndNewlines)
                    store.createProject(title: clean.isEmpty ? "Untitled Motion Project" : clean, templateId: selectedTemplateId)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .keyboardShortcut(.return, modifiers: [])
            }
        }
        .padding(20)
        .frame(width: 680, height: 520)
        .background(StudioTheme.surfaceDark)
    }
}
