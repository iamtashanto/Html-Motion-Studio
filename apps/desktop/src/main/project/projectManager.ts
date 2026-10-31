import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { ProjectData, ProjectAsset, inspectProjectCode } from '@html-motion-studio/shared';

const MAX_FILE_COUNT = 500;
const MAX_SINGLE_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_TOTAL_EXTRACTED_SIZE = 150 * 1024 * 1024; // 150MB
const MAX_DEPTH = 8;

export class ProjectManager {
  private tempWorkspacesDir: string;
  private activeProjectPaths = new Map<string, string>();
  private latestActiveRenderPath: string | undefined;

  constructor(userDataPath: string) {
    this.tempWorkspacesDir = path.join(userDataPath, 'workspaces');
    if (!fs.existsSync(this.tempWorkspacesDir)) {
      fs.mkdirSync(this.tempWorkspacesDir, { recursive: true });
    }
  }

  public getRenderHtmlPath(projectId: string): string | undefined {
    return this.activeProjectPaths.get(projectId) || this.latestActiveRenderPath;
  }

  public getLatestActiveRenderPath(): string | undefined {
    return this.latestActiveRenderPath;
  }

  public getAudioDataUrl(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found at path: ${filePath}`);
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.aac': 'audio/aac',
      '.m4a': 'audio/mp4',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
    };
    const mime = mimeMap[ext] || 'audio/mpeg';
    const buffer = fs.readFileSync(filePath);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  public async openFromPath(targetPath: string): Promise<ProjectData> {
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Target file or folder not found: ${targetPath}`);
    }

    const stat = fs.statSync(targetPath);

    if (stat.isDirectory()) {
      return this.openFolderProject(targetPath);
    }

    const ext = path.extname(targetPath).toLowerCase();
    if (ext === '.zip') {
      return this.openZipArchive(targetPath);
    }

    if (ext === '.html' || ext === '.htm') {
      return this.openSingleHtmlFile(targetPath);
    }

    if (ext === '.hmsproj' || ext === '.json') {
      return this.openSavedProjectFile(targetPath);
    }

    throw new Error(`Unsupported project format: ${ext}. Please select an HTML file, ZIP package, or project folder.`);
  }

  public async openSingleHtmlFile(filePath: string): Promise<ProjectData> {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const title = fileName.replace(/\.[^/.]+$/, '');
    const dir = path.dirname(filePath);

    // Look for sibling assets in the same directory (CSS, JS, images)
    const assets: Record<string, ProjectAsset> = {};
    const missingAssets: string[] = [];

    try {
      const siblingFiles = fs.readdirSync(dir);
      for (const item of siblingFiles) {
        if (item === fileName || item.startsWith('.')) continue;
        const itemPath = path.join(dir, item);
        const itemStat = fs.statSync(itemPath);
        if (itemStat.isFile() && itemStat.size <= MAX_SINGLE_FILE_SIZE) {
          const mime = this.detectMimeType(item);
          const buffer = fs.readFileSync(itemPath);
          const base64 = buffer.toString('base64');
          const dataUri = `data:${mime};base64,${base64}`;

          assets[item] = {
            path: item,
            name: item,
            type: mime,
            size: itemStat.size,
            blobUrl: dataUri,
            content: mime.startsWith('text/') || mime.includes('javascript') || mime.includes('svg')
              ? buffer.toString('utf-8')
              : undefined,
          };
        }
      }
    } catch {
      // Sibling scan is best-effort
    }

    const rewrittenHtml = this.rewriteAssetReferences(rawContent, assets);
    const activeRenderPath = path.join(this.tempWorkspacesDir, `active_${Date.now()}_single.html`);
    try {
      fs.writeFileSync(activeRenderPath, rewrittenHtml, 'utf-8');
    } catch {}

    const id = `file-${Date.now()}`;
    this.activeProjectPaths.set(id, activeRenderPath);
    this.latestActiveRenderPath = activeRenderPath;

    return {
      id,
      title,
      mode: 'file',
      htmlContent: rewrittenHtml,
      renderHtmlPath: activeRenderPath,
      entryHtmlPath: fileName,
      availableHtmlFiles: [fileName],
      assets,
      detectedDuration: 4,
      missingAssets,
    };
  }

  public async openZipArchive(zipPath: string): Promise<ProjectData> {
    const zipBuffer = fs.readFileSync(zipPath);
    const zip = await JSZip.loadAsync(zipBuffer);

    let fileCount = 0;
    let totalSize = 0;
    const assets: Record<string, ProjectAsset> = {};
    const htmlFiles: string[] = [];

    const entries = Object.keys(zip.files);
    if (entries.length > MAX_FILE_COUNT) {
      throw new Error(`ZIP package exceeds maximum file count limit (${MAX_FILE_COUNT} files).`);
    }

    for (const relativePath of entries) {
      const zipEntry = zip.files[relativePath];
      if (zipEntry.dir) continue;

      fileCount++;
      if (fileCount > MAX_FILE_COUNT) {
        throw new Error(`ZIP package exceeds maximum file count limit (${MAX_FILE_COUNT} files).`);
      }

      this.validateSafePath(relativePath);

      const uncompressedSize = (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0;
      if (uncompressedSize > MAX_SINGLE_FILE_SIZE) {
        throw new Error(`ZIP entry '${relativePath}' exceeds 50MB single-file limit.`);
      }

      totalSize += uncompressedSize;
      if (totalSize > MAX_TOTAL_EXTRACTED_SIZE) {
        throw new Error(`ZIP archive exceeds cumulative 150MB uncompressed limit.`);
      }

      const buffer = await zipEntry.async('nodebuffer');
      const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\.\//, '');
      const mime = this.detectMimeType(normalizedPath);
      const isHtml = normalizedPath.toLowerCase().endsWith('.html') || normalizedPath.toLowerCase().endsWith('.htm');

      if (isHtml) {
        htmlFiles.push(normalizedPath);
      }

      const base64 = buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64}`;

      assets[normalizedPath] = {
        path: normalizedPath,
        name: path.basename(normalizedPath),
        type: mime,
        size: buffer.length,
        blobUrl: dataUri,
        content: mime.startsWith('text/') || mime.includes('javascript') || mime.includes('svg')
          ? buffer.toString('utf-8')
          : undefined,
      };
    }

    if (htmlFiles.length === 0) {
      throw new Error('No valid HTML entry file (.html / .htm) found inside ZIP archive.');
    }

    // Determine default entry HTML
    const defaultEntry =
      htmlFiles.find((f) => path.basename(f).toLowerCase() === 'index.html') ||
      htmlFiles.find((f) => !f.includes('/')) ||
      htmlFiles[0];

    const rawHtml = assets[defaultEntry]?.content || '';
    const rewrittenHtml = this.rewriteAssetReferences(rawHtml, assets);
    const title = path.basename(zipPath).replace(/\.[^/.]+$/, '');
    const activeRenderPath = path.join(this.tempWorkspacesDir, `active_${Date.now()}_zip.html`);
    try {
      fs.writeFileSync(activeRenderPath, rewrittenHtml, 'utf-8');
    } catch {}

    const id = `zip-${Date.now()}`;
    this.activeProjectPaths.set(id, activeRenderPath);
    this.latestActiveRenderPath = activeRenderPath;

    return {
      id,
      title,
      mode: 'zip',
      htmlContent: rewrittenHtml,
      renderHtmlPath: activeRenderPath,
      entryHtmlPath: defaultEntry,
      availableHtmlFiles: htmlFiles,
      assets,
      detectedDuration: 5,
      missingAssets: [],
    };
  }

  public async openFolderProject(folderPath: string): Promise<ProjectData> {
    const assets: Record<string, ProjectAsset> = {};
    const htmlFiles: string[] = [];
    let fileCount = 0;
    let totalSize = 0;

    const scanDirectory = (currentDir: string, relativePrefix = '') => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist') continue;
        const fullPath = path.join(currentDir, item);
        const relPath = relativePrefix ? `${relativePrefix}/${item}` : item;

        // Verify symlinks to prevent directory escapes
        const lstat = fs.lstatSync(fullPath);
        if (lstat.isSymbolicLink()) {
          continue; // Safely skip symlinks
        }

        if (lstat.isDirectory()) {
          const depth = relPath.split('/').length;
          if (depth <= MAX_DEPTH) {
            scanDirectory(fullPath, relPath);
          }
          continue;
        }

        if (lstat.isFile()) {
          fileCount++;
          if (fileCount > MAX_FILE_COUNT) {
            throw new Error(`Project folder exceeds maximum file count limit (${MAX_FILE_COUNT} files).`);
          }

          if (lstat.size > MAX_SINGLE_FILE_SIZE) continue;
          totalSize += lstat.size;
          if (totalSize > MAX_TOTAL_EXTRACTED_SIZE) {
            throw new Error(`Project folder exceeds cumulative 150MB limit.`);
          }

          const mime = this.detectMimeType(item);
          const isHtml = item.toLowerCase().endsWith('.html') || item.toLowerCase().endsWith('.htm');
          if (isHtml) {
            htmlFiles.push(relPath);
          }

          const buffer = fs.readFileSync(fullPath);
          const base64 = buffer.toString('base64');
          const dataUri = `data:${mime};base64,${base64}`;

          assets[relPath] = {
            path: relPath,
            name: item,
            type: mime,
            size: lstat.size,
            blobUrl: dataUri,
            content: mime.startsWith('text/') || mime.includes('javascript') || mime.includes('svg')
              ? buffer.toString('utf-8')
              : undefined,
          };
        }
      }
    };

    scanDirectory(folderPath);

    if (htmlFiles.length === 0) {
      throw new Error('No valid HTML entry file (.html / .htm) found in selected project directory.');
    }

    const defaultEntry =
      htmlFiles.find((f) => path.basename(f).toLowerCase() === 'index.html') ||
      htmlFiles.find((f) => !f.includes('/')) ||
      htmlFiles[0];

    const rawHtml = assets[defaultEntry]?.content || '';
    const rewrittenHtml = this.rewriteAssetReferences(rawHtml, assets);
    const title = path.basename(folderPath);
    const activeRenderPath = path.join(this.tempWorkspacesDir, `active_${Date.now()}_folder.html`);
    try {
      fs.writeFileSync(activeRenderPath, rewrittenHtml, 'utf-8');
    } catch {}

    const id = `folder-${Date.now()}`;
    this.activeProjectPaths.set(id, activeRenderPath);
    this.latestActiveRenderPath = activeRenderPath;

    return {
      id,
      title,
      mode: 'file',
      htmlContent: rewrittenHtml,
      renderHtmlPath: activeRenderPath,
      entryHtmlPath: defaultEntry,
      availableHtmlFiles: htmlFiles,
      assets,
      detectedDuration: 5,
      missingAssets: [],
    };
  }

  public async openSavedProjectFile(projectFilePath: string): Promise<ProjectData> {
    const raw = fs.readFileSync(projectFilePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed.htmlContent || !parsed.title) {
      throw new Error('Invalid project file format: missing required project fields.');
    }

    const activeRenderPath = path.join(this.tempWorkspacesDir, `active_${Date.now()}_saved.html`);
    try {
      fs.writeFileSync(activeRenderPath, parsed.htmlContent, 'utf-8');
      parsed.renderHtmlPath = activeRenderPath;
      this.activeProjectPaths.set(parsed.id, activeRenderPath);
      this.latestActiveRenderPath = activeRenderPath;
    } catch {}

    return parsed as ProjectData;
  }

  public async saveProjectToDisk(project: ProjectData, targetPath?: string): Promise<string> {
    const finalPath = targetPath || path.join(this.tempWorkspacesDir, `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.hmsproj`);
    const serialized = JSON.stringify(project, null, 2);
    fs.writeFileSync(finalPath, serialized, 'utf-8');
    return finalPath;
  }

  public syncRenderHtml(htmlContent: string): { success: boolean; renderHtmlPath: string } {
    const renderHtmlPath = path.join(this.tempWorkspacesDir, `active_${Date.now()}_workspace.html`);
    fs.writeFileSync(renderHtmlPath, htmlContent || '<html><body></body></html>', 'utf-8');
    this.latestActiveRenderPath = renderHtmlPath;
    return { success: true, renderHtmlPath };
  }

  public validateSafePath(entryPath: string): void {
    if (typeof entryPath !== 'string') throw new Error('Invalid file path in archive');
    if (entryPath.includes('\0')) throw new Error('Path traversal detected: null byte');
    if (entryPath.startsWith('/') || entryPath.startsWith('\\')) throw new Error('Absolute paths not allowed in archive');

    const normalized = path.normalize(entryPath).replace(/\\/g, '/');
    if (normalized.startsWith('../') || normalized === '..' || normalized.includes('/../')) {
      throw new Error(`Path traversal rejected: ${entryPath}`);
    }

    const depth = normalized.split('/').filter(Boolean).length;
    if (depth > MAX_DEPTH) {
      throw new Error(`Archive exceeds directory nesting depth ceiling (${MAX_DEPTH})`);
    }
  }

  public rewriteAssetReferences(html: string, assets: Record<string, ProjectAsset>): string {
    let result = html;

    // Sort paths by length descending so deeper nested paths match first
    const sortedPaths = Object.keys(assets).sort((a, b) => b.length - a.length);

    for (const assetPath of sortedPaths) {
      const asset = assets[assetPath];
      if (!asset || !asset.blobUrl) continue;

      // Replace variants: "./asset.png", "asset.png", "/asset.png"
      const basename = path.basename(assetPath);
      const variations = [
        assetPath,
        `./${assetPath}`,
        `/${assetPath}`,
        basename,
        `./${basename}`,
      ];

      for (const variant of variations) {
        const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match in src="", href="", url(''), url("")
        const srcRegex = new RegExp(`(src\\s*=\\s*["'])${escaped}(["'])`, 'gi');
        result = result.replace(srcRegex, `$1${asset.blobUrl}$2`);

        const hrefRegex = new RegExp(`(href\\s*=\\s*["'])${escaped}(["'])`, 'gi');
        result = result.replace(hrefRegex, `$1${asset.blobUrl}$2`);

        const urlRegex = new RegExp(`(url\\s*\\(\\s*["']?)${escaped}(["']?\\s*\\))`, 'gi');
        result = result.replace(urlRegex, `$1${asset.blobUrl}$2`);
      }
    }

    return result;
  }

  private detectMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const map: Record<string, string> = {
      '.html': 'text/html',
      '.htm': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.aac': 'audio/aac',
      '.m4a': 'audio/mp4',
    };
    return map[ext] || 'application/octet-stream';
  }
}

