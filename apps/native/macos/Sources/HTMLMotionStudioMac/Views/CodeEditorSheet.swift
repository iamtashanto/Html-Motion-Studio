import SwiftUI
import AppKit

struct CodeEditorSheet: View {
    @ObservedObject var store: StudioStore
    @Environment(\.dismiss) private var dismiss

    @State private var activeTab: Int = 0 // 0 HTML, 1 CSS, 2 JS
    @State private var htmlCode: String = ""
    @State private var cssCode: String = ""
    @State private var jsCode: String = ""
    @State private var appliedBanner = false
    @State private var copiedBanner = false

    private var currentCodeBinding: Binding<String> {
        switch activeTab {
        case 1: return $cssCode
        case 2: return $jsCode
        default: return $htmlCode
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack(spacing: 12) {
                Label("Motion Code Editor", systemImage: "chevron.left.forwardslash.chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.white)

                Picker("", selection: $activeTab) {
                    Text("HTML").tag(0)
                    Text("CSS").tag(1)
                    Text("JavaScript").tag(2)
                }
                .pickerStyle(.segmented)
                .frame(width: 240)

                Spacer()

                Button("Format") { formatHtml() }
                    .buttonStyle(.bordered)

                Button(copiedBanner ? "Copied!" : "Copy") {
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(currentCodeBinding.wrappedValue, forType: .string)
                    copiedBanner = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { copiedBanner = false }
                }
                .buttonStyle(.bordered)

                Button(appliedBanner ? "Applied!" : "Apply to Preview") {
                    applyChanges()
                }
                .buttonStyle(.borderedProminent)
                .keyboardShortcut("s", modifiers: .command)

                Button("Close") { dismiss() }
                    .keyboardShortcut(.escape, modifiers: [])
            }
            .padding(14)
            .background(StudioTheme.surfaceDark)
            .overlay(alignment: .bottom) {
                Rectangle().fill(StudioTheme.border).frame(height: 1)
            }

            // Code Workspace
            TextEditor(text: currentCodeBinding)
                .font(.system(size: 12, design: .monospaced))
                .scrollContentBackground(.hidden)
                .background(Color(red: 0.024, green: 0.035, blue: 0.063))
                .foregroundColor(StudioTheme.textPrimary)
                .padding(8)
                .background(Color(red: 0.024, green: 0.035, blue: 0.063))

            // Footer
            HStack {
                let code = currentCodeBinding.wrappedValue
                let lines = code.components(separatedBy: .newlines).count
                Text("Lines: \(lines)  •  Chars: \(code.count)  •  UTF-8")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(StudioTheme.textSecondary)
                Spacer()
                Text("Press ⌘S to apply live to WKWebView stage")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(StudioTheme.accentCyan)
            }
            .padding(.horizontal, 14)
            .frame(height: 30)
            .background(StudioTheme.surfaceDark)
        }
        .frame(width: 920, height: 640)
        .onAppear { loadFromProject() }
    }

    private func loadFromProject() {
        let html = store.project.htmlContent
        htmlCode = html
        cssCode = extractTag(html: html, pattern: "<style[^>]*>([\\s\\S]*?)</style>")
            ?? "/* Embedded CSS styles */\nbody {\n  margin: 0;\n}"
        jsCode = extractTag(html: html, pattern: "<script[^>]*>([\\s\\S]*?)</script>")
            ?? "// Custom animation scripts\n"
    }

    private func applyChanges() {
        var finalHtml = htmlCode
        if activeTab == 1 {
            if let range = finalHtml.range(of: "<style[^>]*>[\\s\\S]*?</style>", options: [.regularExpression, .caseInsensitive]) {
                finalHtml.replaceSubrange(range, with: "<style>\n\(cssCode)\n</style>")
            } else if let headEnd = finalHtml.range(of: "</head>", options: .caseInsensitive) {
                finalHtml.replaceSubrange(headEnd, with: "<style>\n\(cssCode)\n</style>\n</head>")
            } else {
                finalHtml = "<style>\n\(cssCode)\n</style>\n\(finalHtml)"
            }
        } else if activeTab == 2 {
            if let range = finalHtml.range(of: "<script[^>]*>[\\s\\S]*?</script>", options: [.regularExpression, .caseInsensitive]) {
                finalHtml.replaceSubrange(range, with: "<script>\n\(jsCode)\n</script>")
            } else if let bodyEnd = finalHtml.range(of: "</body>", options: .caseInsensitive) {
                finalHtml.replaceSubrange(bodyEnd, with: "<script>\n\(jsCode)\n</script>\n</body>")
            } else {
                finalHtml = "\(finalHtml)\n<script>\n\(jsCode)\n</script>"
            }
        }
        htmlCode = finalHtml
        store.updateHtmlContent(finalHtml)
        appliedBanner = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { appliedBanner = false }
    }

    private func formatHtml() {
        guard activeTab == 0 else { return }
        var formatted = ""
        var indent = 0
        for line in htmlCode.components(separatedBy: .newlines) {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if trimmed.hasPrefix("</") { indent = max(0, indent - 1) }
            formatted += String(repeating: "  ", count: indent) + trimmed + "\n"
            if trimmed.hasPrefix("<") && !trimmed.hasPrefix("</") && !trimmed.hasPrefix("<!") && !trimmed.hasSuffix("/>") && !trimmed.contains("</") {
                indent += 1
            }
        }
        htmlCode = formatted.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private func extractTag(html: String, pattern: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else { return nil }
        let ns = html as NSString
        guard let match = regex.firstMatch(in: html, range: NSRange(location: 0, length: ns.length)),
              match.numberOfRanges > 1 else { return nil }
        return ns.substring(with: match.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
