# HTML Motion Studio Web — Security Architecture & Hardening Guide

**Classification**: Public Engineering Documentation  
**Principle**: Treat all imported HTML, CSS, JavaScript, and ZIP archives as untrusted user input. All execution is strictly client-side.

---

## 1. Sandboxed Iframe Execution Isolation

Imported animation code is untrusted and must never execute in the privileged application origin.

### A. Iframe Attributes
```html
<iframe
  title="HTML Animation Preview"
  srcDoc="..."
  sandbox="allow-scripts"
  className="..."
/>
```

> **Critical Security Hardening**:
> The preview iframe explicitly omits `allow-same-origin`. Combining `allow-scripts` and `allow-same-origin` on documents served from the same domain is a known W3C security anti-pattern that permits an embedded script to access `parent.document` and strip its own sandbox. By omitting `allow-same-origin`, the embedded document is assigned a unique opaque origin (`null`).

### B. Content Security Policy (CSP)
For the preview iframe and Next.js document headers:
* `default-src 'self' blob: data:;`
* `script-src 'unsafe-inline' 'unsafe-eval' blob:;`
* `style-src 'unsafe-inline' 'self';`
* `object-src 'none';`
* `base-uri 'none';`

---

## 2. ZIP Archive Protection & Decompression Safeguards

ZIP archives present two major client-side attack vectors: **Path Traversal (Zip Slip)** and **Decompression Bombs (Zip Bombs)**.

### A. Path Traversal Mitigation (`zipHandler.ts`)
```typescript
export function isSafePath(path: string): boolean {
  if (path.includes('../') || path.includes('..\\')) return false;
  if (path.startsWith('/') || path.startsWith('\\')) return false;
  if (path.includes('\0')) return false;
  return true;
}
```
* Rejects any path segments containing directory traversal (`../` or `..\`).
* Rejects absolute root paths (`/etc/`, `C:\`).
* Rejects null-byte poisoning (`\0`).

### B. Decompression Bomb Protection
```typescript
export const ZIP_LIMITS = {
  MAX_FILES: 500,
  MAX_SINGLE_FILE_BYTES: 50 * 1024 * 1024,       // 50 MB
  MAX_TOTAL_UNCOMPRESSED_BYTES: 100 * 1024 * 1024, // 100 MB
  MAX_COMPRESSION_RATIO: 100,                     // 100:1 ratio warning
};
```
* **Maximum File Count**: Limited to 500 entries per archive.
* **Maximum Single File Size**: 50 MB uncompressed.
* **Cumulative Uncompressed Ceiling**: 100 MB aggregate memory threshold. Extraction terminates immediately and revokes all allocated memory if exceeded.

---

## 3. Memory & Resource Cleanup (`revokeProjectAssets`)

To prevent memory leaks over sustained user sessions:
* Every Object URL generated via `URL.createObjectURL(blob)` during ZIP extraction is tracked.
* When a user loads a new template, uploads a new HTML file, or imports a new ZIP, `revokeProjectAssets(previousAssets)` is executed to deallocate memory buffers from browser storage immediately.

---

## 4. Privacy Guarantee

* **100% Client-Side Conversion**: No project files, animation code, audio tracks, or exported video files are transmitted to external cloud servers or AI APIs.
* **No Telemetry Leaks**: Code inspection is performed using static regex scanning within the user's browser runtime.

