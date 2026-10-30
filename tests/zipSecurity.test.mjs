import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from '../packages/renderer/node_modules/jszip/lib/index.js';

const ZIP_LIMITS = {
  MAX_FILES: 500,
  MAX_SINGLE_FILE_BYTES: 50 * 1024 * 1024,
  MAX_TOTAL_UNCOMPRESSED_BYTES: 100 * 1024 * 1024,
  MAX_DIRECTORY_DEPTH: 8,
};

function isSafePath(path) {
  if (path.includes('../') || path.includes('..\\')) return false;
  if (path.startsWith('/') || path.startsWith('\\')) return false;
  if (path.includes('\0')) return false;
  if (path.split('/').length > ZIP_LIMITS.MAX_DIRECTORY_DEPTH) return false;
  return true;
}

test('isSafePath allows normal and nested relative paths', () => {
  assert.equal(isSafePath('index.html'), true);
  assert.equal(isSafePath('assets/css/main.css'), true);
  assert.equal(isSafePath('assets/images/sprites/logo.svg'), true);
});

test('isSafePath rejects path traversal and absolute paths', () => {
  assert.equal(isSafePath('../etc/passwd'), false);
  assert.equal(isSafePath('assets/../../secret.txt'), false);
  assert.equal(isSafePath('/root/malicious.js'), false);
  assert.equal(isSafePath('\\Windows\\System32\\cmd.exe'), false);
  assert.equal(isSafePath('file.txt\0.exe'), false);
});

test('isSafePath rejects excessive directory nesting depth (> 8)', () => {
  const deepPath = 'a/b/c/d/e/f/g/h/i/j/deep.html';
  assert.equal(isSafePath(deepPath), false);
});

test('JSZip simulates zip bomb detection when aggregate size exceeds ceiling', async () => {
  const zip = new JSZip();
  // Add 10 dummy files
  for (let i = 0; i < 10; i++) {
    zip.file(`file_${i}.txt`, 'A'.repeat(1000));
  }

  let totalBytes = 0;
  const simulatedLimit = 5000; // Small limit for test
  let limitTriggered = false;

  for (const [name, entry] of Object.entries(zip.files)) {
    const data = await entry.async('uint8array');
    totalBytes += data.byteLength;
    if (totalBytes > simulatedLimit) {
      limitTriggered = true;
      break;
    }
  }

  assert.equal(limitTriggered, true);
});

test('ZIP multiple HTML entries detection and default selection', async () => {
  const zip = new JSZip();
  zip.file('index.html', '<html><body>Home</body></html>');
  zip.file('about.html', '<html><body>About</body></html>');
  zip.file('banner.html', '<html><body>Banner</body></html>');

  const htmlFiles = Object.keys(zip.files).filter(k => k.endsWith('.html'));
  assert.equal(htmlFiles.length, 3);

  // Default entry should prioritize index.html
  const defaultEntry = htmlFiles.find(f => f.toLowerCase() === 'index.html') || htmlFiles[0];
  assert.equal(defaultEntry, 'index.html');
});
