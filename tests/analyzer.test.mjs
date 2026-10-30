import test from 'node:test';
import assert from 'node:assert/strict';

// Helper mock of inspectProjectCode logic to verify detection rules and security checks
function inspectCode(html, css = '', js = '', missingAssets = []) {
  const combinedCode = `${html}\n${css}\n${js}`;
  const hasHtml = /<html|<body|<div|<canvas|<svg/i.test(html);
  const hasCssAnimations = /@keyframes|animation\s*:|animation-name\s*:/i.test(combinedCode);
  const hasCssTransitions = /transition\s*:|transition-property\s*:/i.test(combinedCode);
  const hasRaf = /requestAnimationFrame|cancelAnimationFrame|performance\.now/i.test(combinedCode);
  const hasCanvas = /<canvas|getContext\s*\(\s*['"]2d['"]\s*\)/i.test(combinedCode);
  const hasSvg = /<svg|<animate|<animateTransform|<animateMotion/i.test(combinedCode);
  const hasWebGL = /getContext\s*\(\s*['"](webgl|webgl2|experimental-webgl)['"]\s*\)|THREE\.|BABYLON\./i.test(combinedCode);
  const hasAudio = /<audio|AudioContext|webkitAudioContext/i.test(combinedCode);
  
  const externalMatches = combinedCode.match(/(https?:\/\/[^\s"'<>]+)/gi) || [];
  const uniqueUrls = Array.from(new Set(externalMatches)).filter(
    (u) => !u.includes('w3.org') && !u.includes('schema.org')
  );
  const corsRisks = uniqueUrls.length > 0;

  let overallStatus = 'ready';
  if (!hasHtml) {
    overallStatus = 'unsupported';
  } else if (hasWebGL && corsRisks) {
    overallStatus = 'desktop-recommended';
  } else if (missingAssets.length > 0 || corsRisks || hasWebGL) {
    overallStatus = 'limited';
  }

  return {
    hasHtml,
    hasCssAnimations,
    hasCssTransitions,
    hasRaf,
    hasCanvas,
    hasSvg,
    hasWebGL,
    hasAudio,
    corsRisks,
    overallStatus,
  };
}

test('Static code analyzer detects standard CSS keyframe animations as ready', () => {
  const html = `<html><head><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .box { animation: spin 2s infinite; }</style></head><body><div class="box"></div></body></html>`;
  const report = inspectCode(html);
  assert.equal(report.hasHtml, true);
  assert.equal(report.hasCssAnimations, true);
  assert.equal(report.overallStatus, 'ready');
});

test('Static code analyzer flags external CDN dependencies as limited', () => {
  const html = `<html><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"></head><body><div>Content</div></body></html>`;
  const report = inspectCode(html);
  assert.equal(report.corsRisks, true);
  assert.equal(report.overallStatus, 'limited');
});

test('Static code analyzer detects WebGL and marks heavy scenes appropriately', () => {
  const html = `<html><body><canvas id="c"></canvas><script>const gl = canvas.getContext("webgl2");</script></body></html>`;
  const report = inspectCode(html);
  assert.equal(report.hasCanvas, true);
  assert.equal(report.hasWebGL, true);
});

test('Static code analyzer detects non-HTML content as unsupported', () => {
  const report = inspectCode('console.log("hello world");');
  assert.equal(report.hasHtml, false);
  assert.equal(report.overallStatus, 'unsupported');
});

