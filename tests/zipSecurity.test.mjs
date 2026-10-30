import test from 'node:test';
import assert from 'node:assert/strict';

function isSafePath(path) {
  if (path.includes('../') || path.includes('..\\')) return false;
  if (path.startsWith('/') || path.startsWith('\\')) return false;
  if (path.includes('\0')) return false;
  return true;
}

test('isSafePath allows relative paths without traversal', () => {
  assert.equal(isSafePath('index.html'), true);
  assert.equal(isSafePath('assets/style.css'), true);
  assert.equal(isSafePath('images/logo.svg'), true);
  assert.equal(isSafePath('scripts/vendor/main.js'), true);
});

test('isSafePath blocks directory traversal attacks', () => {
  assert.equal(isSafePath('../etc/passwd'), false);
  assert.equal(isSafePath('assets/../../secret.txt'), false);
  assert.equal(isSafePath('..\\windows\\system32'), false);
});

test('isSafePath blocks leading absolute paths and null bytes', () => {
  assert.equal(isSafePath('/var/www/index.html'), false);
  assert.equal(isSafePath('\\Users\\admin\\file.txt'), false);
  assert.equal(isSafePath('file.txt\0.exe'), false);
});

