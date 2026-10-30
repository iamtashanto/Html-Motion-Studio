import JSZip from 'jszip';
import { ProjectAsset } from '@/types/project';

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
function isSafePath(path: string): boolean {
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

export async function processZipFile(file: File): Promise<ExtractedZipResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const assets: Record<string, ProjectAsset> = {};
  const htmlFiles: string[] = [];

  // 1. First pass: extract all files safely into memory
  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    if (zipEntry.dir) continue;

    // Normalize path: replace backslashes, remove leading ./
    const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\.\//, '');

    // Skip OS junk files (e.g., __MACOSX, .DS_Store)
    if (normalizedPath.startsWith('__MACOSX') || normalizedPath.endsWith('.DS_Store')) {
      continue;
    }

    if (!isSafePath(normalizedPath)) {
      console.warn(`[Security] Skipped unsafe path in ZIP: ${normalizedPath}`);
      continue;
    }

    const mime = getMimeType(normalizedPath);
    let blobUrl = '';
    let content: string | undefined = undefined;

    if (mime.startsWith('text/') || mime === 'application/javascript' || mime === 'image/svg+xml' || mime === 'application/json') {
      content = await zipEntry.async('string');
      const blob = new Blob([content], { type: mime });
      blobUrl = URL.createObjectURL(blob);
    } else {
      const blob = await zipEntry.async('blob');
      blobUrl = URL.createObjectURL(blob);
    }

    assets[normalizedPath] = {
      path: normalizedPath,
      name: normalizedPath.split('/').pop() || normalizedPath,
      type: mime,
      size: (await zipEntry.async('uint8array')).byteLength,
      blobUrl,
      content,
    };

    if (normalizedPath.toLowerCase().endsWith('.html') || normalizedPath.toLowerCase().endsWith('.htm')) {
      htmlFiles.push(normalizedPath);
    }
  }

  if (htmlFiles.length === 0) {
    throw new Error('No HTML entry file found in ZIP archive.');
  }

  // 2. Select default entry point (prefer index.html or root-level HTML)
  let defaultEntry = htmlFiles.find((f) => f.toLowerCase() === 'index.html' || f.toLowerCase().endsWith('/index.html'));
  if (!defaultEntry) {
    defaultEntry = htmlFiles[0];
  }

  // 3. Inspect referenced assets in HTML and CSS to detect missing dependencies
  const missingAssets = detectMissingAssets(assets, defaultEntry);

  return {
    assets,
    htmlFiles,
    defaultEntry,
    missingAssets,
  };
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

  // Helper to resolve relative path from entryDir
  const resolvePath = (relative: string): string => {
    // Strip leading ./
    let clean = relative.replace(/^\.\//, '');
    if (clean.startsWith('/')) clean = clean.substring(1);

    if (entryDir && !clean.startsWith(entryDir)) {
      const combined = (entryDir + clean).replace(/\/+/g, '/');
      if (assets[combined]) return combined;
    }
    return clean;
  };

  // Replace src="..." and href="..." and background="..."
  rewritten = rewritten.replace(/\b(src|href|poster)\s*=\s*["']([^"']+)["']/gi, (match, attr, url) => {
    // Ignore external URLs, data URLs, anchors, mailto, javascript
    if (/^(https?:|\/\/|data:|blob:|#|mailto:|javascript:)/i.test(url)) {
      return match;
    }

    const resolved = resolvePath(url);
    if (assets[resolved]) {
      return `${attr}="${assets[resolved].blobUrl}"`;
    }
    // Also try basename match if nested folders differed
    const baseMatch = Object.keys(assets).find((k) => k.endsWith('/' + url) || k === url);
    if (baseMatch && assets[baseMatch]) {
      return `${attr}="${assets[baseMatch].blobUrl}"`;
    }

    return match;
  });

  // Replace url(...) inside inline styles or <style> blocks
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

