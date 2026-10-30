# HTML Motion Studio Desktop — Security & Isolation Specification

## 1. Threat Model & Security Posture

HTML Motion Studio Desktop executes arbitrary, user-imported HTML, CSS, and JavaScript. The security architecture treats all imported content as untrusted code executing within an adversarial boundary.

---

## 2. Electron Hardening Controls

### 2.1 Context Isolation & Node Integration
```typescript
webPreferences: {
  preload: path.join(__dirname, '../preload/preload.js'),
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webgl: true,
}
```
1. **`nodeIntegration: false`**: Prohibits user-supplied JavaScript from calling `require()`, `process`, `fs`, `child_process`, or any native Node.js APIs.
2. **`contextIsolation: true`**: Runs preload scripts and the main UI in a completely isolated JavaScript execution context. Even if a prototype pollution vulnerability occurred in imported DOM elements, the Electron IPC bridge cannot be intercepted.
3. **`sandbox: true`**: Enforces Chromium's multi-process OS-level sandbox around renderer processes.

### 2.2 Untrusted Preview Iframe Isolation
Inside the application UI, imported HTML is mounted inside a sandboxed `<iframe>`:
```html
<iframe
  sandbox="allow-scripts"
  srcDoc="{sanitizedHtmlContent}"
  title="HTML Animation Preview"
/>
```
- Notice that **`allow-same-origin` is omitted**. The imported HTML executes under an opaque `null` origin, meaning it cannot access indexedDB, cookies, localStorage, or credentials of the parent host application.

---

## 3. Safe Project Import & ZIP Hardening

### 3.1 Path Traversal Rejection
In `projectManager.ts`, every file entry in imported ZIP archives and project directories is validated against path traversal attack vectors:
```typescript
if (entryPath.includes('\0')) {
  throw new Error('Path traversal detected: null byte');
}
if (entryPath.startsWith('/') || entryPath.startsWith('\\')) {
  throw new Error('Absolute paths not allowed in archive');
}
const normalized = path.normalize(entryPath).replace(/\\/g, '/');
if (normalized.startsWith('../') || normalized === '..' || normalized.includes('/../')) {
  throw new Error(`Path traversal rejected: ${entryPath}`);
}
```

### 3.2 Nesting Depth Limit
Directories nested deeper than **8 levels** are rejected to prevent path exhaustion and stack overflow attacks.

### 3.3 ZIP Bomb & Resource Ceilings
To prevent CPU and disk denial-of-service attacks:
- **Maximum File Count**: 500 files per archive.
- **Maximum Single File Size**: 50 MB uncompressed.
- **Maximum Cumulative Size**: 150 MB total extracted volume.
- **Symbolic Link Prevention**: In project folder scanning, `lstat.isSymbolicLink()` is checked and symlinks are skipped to prevent directory escapes into system files.

---

## 4. Safe FFmpeg Execution & Shell Injection Prevention

1. **No Shell Execution**: The FFmpeg pipeline uses `child_process.spawn()` directly, passing arguments as a discrete array of string literals rather than invoking a shell (`sh -c` or `cmd.exe`).
2. **Path Sanitization**: All output paths and frame patterns are strictly resolved using Node.js `path.resolve()` and verified to exist within intended output directories.
3. **Bounded Buffering**: Frames are written sequentially to temporary files and cleaned up immediately after encoding.

