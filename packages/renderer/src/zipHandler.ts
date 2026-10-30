import JSZip from 'jszip';
import { ProjectAsset } from '@html-motion-studio/shared';

// Strict Security Limits to prevent Zip Bomb and memory exhaustion
export const ZIP_LIMITS = {
  MAX_FILES: 500,
  MAX_SINGLE_FILE_BYTES: 50 * 1024 * 1024, // 50 MB
  MAX_TOTAL_UNCOMPRESSED_BYTES: 100 * 1024 * 1024, // 100 MB
  MAX_COMPRESSION_RATIO: 100, // 100:1 ratio warning
};

// Mime types lookup
const MIME_TYPES: Record<string, string> = {
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
};

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Validates against directory traversal vulnerabilities.
 */
export function isSafePath(path: string): boolean {
  // Prevent ../ traversal
  if (path.includes('../') || path.includes('..\\')) return false;
  // Prevent leading absolute paths
  if (path.startsWith('/') || path.startsWith('\\')) return false;
  // Prevent null bytes
  if (path.includes('\0')) return false;
  return true;
}

export interface ExtractedZipResult {
  assets: Record<string, ProjectAsset>;
  htmlFiles: string[];
  defaultEntry: string;
  missingAssets: string[];
}

/**
 * Safely extracts a ZIP archive in memory with decompression bomb and path traversal protection.
 */
export async function processZipFile(file: File): Promise<ExtractedZipResult> {
  if (file.size > ZIP_LIMITS.MAX_SINGLE_FILE_BYTES) {
    throw new Error(
      `ZIP archive size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds browser safeguard limit of ${ZIP_LIMITS.MAX_SINGLE_FILE_BYTES / (1024 * 1024)} MB.`
    );
  }

  const zip = new JSZip();
  let loadedZip: JSZip;
  try {
    loadedZip = await zip.loadAsync(file);
  } catch {
    throw new Error('Malformed or corrupt ZIP archive. Could not parse archive header.');
  }

  const entries = Object.entries(loadedZip.files).filter(([, entry]) => !entry.dir);

  // File count check
  if (entries.length > ZIP_LIMITS.MAX_FILES) {
    throw new Error(
      `Archive contains ${entries.length} files, which exceeds the limit of ${ZIP_LIMITS.MAX_FILES} files.`
    );
  }

  const assets: Record<string, ProjectAsset> = {};
  const htmlFiles: string[] = [];
  let totalUncompressedBytes = 0;

  // Safe extraction loop with cumulative uncompressed size checks
  for (const [relativePath, zipEntry] of entries) {
    // Normalize path
    const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\.\//, '');

    // Skip OS metadata junk
    if (normalizedPath.startsWith('__MACOSX') || normalizedPath.endsWith('.DS_Store')) {
      continue;
    }

    // Path traversal check
    if (!isSafePath(normalizedPath)) {
      console.warn(`[Security] Skipped unsafe path in ZIP: ${normalizedPath}`);
      continue;
    }

    const uint8Data = await zipEntry.async('uint8array');
    const entryBytes = uint8Data.byteLength;

    // Single-file size check
    if (entryBytes > ZIP_LIMITS.MAX_SINGLE_FILE_BYTES) {
      throw new Error(
        `File "${normalizedPath}" exceeds single-file limit (${(entryBytes / (1024 * 1024)).toFixed(1)} MB).`
      );
    }

    totalUncompressedBytes += entryBytes;

    // Total archive expansion check (Zip bomb protection)
    if (totalUncompressedBytes > ZIP_LIMITS.MAX_TOTAL_UNCOMPRESSED_BYTES) {
      // Clean up already created blobs
      revokeProjectAssets(assets);
      throw new Error(
        `Total uncompressed size exceeds security threshold of ${ZIP_LIMITS.MAX_TOTAL_UNCOMPRESSED_BYTES / (1024 * 1024)} MB. Possible decompression bomb detected.`
      );
    }

    const mime = getMimeType(normalizedPath);
    let blobUrl = '';
    let content: string | undefined = undefined;

    if (
      mime.startsWith('text/') ||
      mime === 'application/javascript' ||
      mime === 'image/svg+xml' ||
      mime === 'application/json'
    ) {
      const decoder = new TextDecoder();
      content = decoder.decode(uint8Data);
      const blob = new Blob([content], { type: mime });
      blobUrl = URL.createObjectURL(blob);
    } else {
      const blob = new Blob([uint8Data.buffer as ArrayBuffer], { type: mime });
      blobUrl = URL.createObjectURL(blob);
    }

    assets[normalizedPath] = {
      path: normalizedPath,
      name: normalizedPath.split('/').pop() || normalizedPath,
      type: mime,
      size: entryBytes,
      blobUrl,
      content,
    };

    if (normalizedPath.toLowerCase().endsWith('.html') || normalizedPath.toLowerCase().endsWith('.htm')) {
      htmlFiles.push(normalizedPath);
    }
  }

  if (htmlFiles.length === 0) {
    revokeProjectAssets(assets);
    throw new Error('No HTML entry file found in ZIP archive.');
  }

  // Select default entry point (prefer index.html or root-level HTML)
  let defaultEntry = htmlFiles.find(
    (f) => f.toLowerCase() === 'index.html' || f.toLowerCase().endsWith('/index.html')
  );
  if (!defaultEntry) {
    defaultEntry = htmlFiles[0];
  }

  const missingAssets = detectMissingAssets(assets, defaultEntry);

  return {
    assets,
    htmlFiles,
    defaultEntry,
    missingAssets,
  };
}

/**
 * Revokes all Blob URLs associated with a project to prevent browser memory leaks.
 */
export function revokeProjectAssets(assets: Record<string, ProjectAsset>): void {
  for (const asset of Object.values(assets)) {
    if (asset.blobUrl && asset.blobUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(asset.blobUrl);
      } catch {
        // Ignore revocation error
      }
    }
  }
}

/**
 * Rewrites relative paths in HTML and CSS so they reference in-memory blob URLs
 */
export function rewriteHtmlWithAssets(
  htmlContent: string,
  entryPath: string,
  assets: Record<string, ProjectAsset>
): string {
  let rewritten = htmlContent;

  const entryDir = entryPath.includes('/') ? entryPath.substring(0, entryPath.lastIndexOf('/') + 1) : '';

  const resolvePath = (relative: string): string => {
    let clean = relative.replace(/^\.\//, '');
    if (clean.startsWith('/')) clean = clean.substring(1);

    if (entryDir && !clean.startsWith(entryDir)) {
      const combined = (entryDir + clean).replace(/\/+/g, '/');
      if (assets[combined]) return combined;
    }
    return clean;
  };

  rewritten = rewritten.replace(/\b(src|href|poster)\s*=\s*["']([^"']+)["']/gi, (match, attr, url) => {
    if (/^(https?:|\/\/|data:|blob:|#|mailto:|javascript:)/i.test(url)) {
      return match;
    }

    const resolved = resolvePath(url);
    if (assets[resolved]) {
      return `${attr}="${assets[resolved].blobUrl}"`;
    }
    const baseMatch = Object.keys(assets).find((k) => k.endsWith('/' + url) || k === url);
    if (baseMatch && assets[baseMatch]) {
      return `${attr}="${assets[baseMatch].blobUrl}"`;
    }

    return match;
  });

  rewritten = rewritten.replace(/url\(\s*["']?([^"')]+)["']?\s*\)/gi, (match, url) => {
    if (/^(https?:|\/\/|data:|blob:|#)/i.test(url)) {
      return match;
    }
    const resolved = resolvePath(url);
    if (assets[resolved]) {
      return `url("${assets[resolved].blobUrl}")`;
    }
    return match;
  });

  return rewritten;
}

function detectMissingAssets(assets: Record<string, ProjectAsset>, entryHtmlPath: string): string[] {
  const missing: string[] = [];
  const entryAsset = assets[entryHtmlPath];
  if (!entryAsset || !entryAsset.content) return missing;

  const regex = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(entryAsset.content)) !== null) {
    const url = match[1];
    if (/^(https?:|\/\/|data:|blob:|#|mailto:|javascript:)/i.test(url)) continue;

    const clean = url.replace(/^\.\//, '').replace(/^\//, '');
    const found = Object.keys(assets).some((p) => p.endsWith(clean) || p === clean);
    if (!found && !missing.includes(url)) {
      missing.push(url);
    }
  }

  return missing;
}
