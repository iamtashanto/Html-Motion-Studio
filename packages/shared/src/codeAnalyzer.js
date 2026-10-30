"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectProjectCode = inspectProjectCode;
function inspectProjectCode(input) {
    const { html, css = '', js = '', missingAssets } = input;
    const combinedCode = `${html}\n${css}\n${js}`;
    const checks = [];
    const warnings = [];
    // 1. HTML availability
    const hasHtml = /<html|<body|<div|<canvas|<svg/i.test(html);
    checks.push({
        id: 'html-structure',
        name: 'HTML Document Structure',
        detected: hasHtml,
        status: hasHtml ? 'ok' : 'error',
        details: hasHtml
            ? 'Valid HTML markup elements detected.'
            : 'No standard HTML structure detected.',
    });
    // 2. CSS Animations
    const hasCssAnimations = /@keyframes|animation\s*:|animation-name\s*:/i.test(combinedCode);
    checks.push({
        id: 'css-animations',
        name: 'CSS Keyframe Animations',
        detected: hasCssAnimations,
        status: 'ok',
        details: hasCssAnimations
            ? 'CSS keyframe motion detected. Supports smooth frame-by-frame or real-time capture.'
            : 'No CSS keyframe animations detected.',
    });
    // 3. CSS Transitions
    const hasCssTransitions = /transition\s*:|transition-property\s*:/i.test(combinedCode);
    checks.push({
        id: 'css-transitions',
        name: 'CSS Transitions',
        detected: hasCssTransitions,
        status: hasCssTransitions ? 'info' : 'ok',
        details: hasCssTransitions
            ? 'CSS transitions detected (ensure triggering events run automatically or via scripts during preview).'
            : 'No CSS transitions detected.',
    });
    // 4. requestAnimationFrame
    const hasRaf = /requestAnimationFrame|cancelAnimationFrame|performance\.now/i.test(combinedCode);
    checks.push({
        id: 'raf-loops',
        name: 'requestAnimationFrame Motion Loops',
        detected: hasRaf,
        status: hasRaf ? 'ok' : 'info',
        details: hasRaf
            ? 'JavaScript continuous animation loop detected.'
            : 'No rAF animation loops detected.',
    });
    // 5. Canvas 2D
    const hasCanvas = /<canvas|getContext\s*\(\s*['"]2d['"]\s*\)/i.test(combinedCode);
    checks.push({
        id: 'canvas-2d',
        name: 'HTML5 Canvas 2D',
        detected: hasCanvas,
        status: 'ok',
        details: hasCanvas
            ? 'Canvas 2D context detected. Ideal for direct pixel capture.'
            : 'No Canvas elements detected.',
    });
    // 6. SVG Animations
    const hasSvg = /<svg|<animate|<animateTransform|<animateMotion/i.test(combinedCode);
    checks.push({
        id: 'svg-elements',
        name: 'SVG Graphics & SMIL',
        detected: hasSvg,
        status: 'ok',
        details: hasSvg
            ? 'SVG vector elements detected.'
            : 'No SVG elements detected.',
    });
    // 7. WebGL / 3D
    const hasWebGL = /getContext\s*\(\s*['"](webgl|webgl2|experimental-webgl)['"]\s*\)|THREE\.|BABYLON\./i.test(combinedCode);
    checks.push({
        id: 'webgl-3d',
        name: 'WebGL / 3D Graphics',
        detected: hasWebGL,
        status: hasWebGL ? 'warning' : 'ok',
        details: hasWebGL
            ? 'WebGL / 3D rendering detected. GPU-heavy scenes may suffer frame drops in browser; desktop app recommended for heavy scenes.'
            : 'No WebGL 3D contexts detected.',
    });
    if (hasWebGL) {
        warnings.push('WebGL 3D graphics detected. Complex shaders may reduce export framerates in browser.');
    }
    // 8. Audio
    const hasAudio = /<audio|AudioContext|webkitAudioContext|createMediaElementSource/i.test(combinedCode);
    checks.push({
        id: 'audio-elements',
        name: 'Embedded Audio Elements',
        detected: hasAudio,
        status: 'info',
        details: hasAudio
            ? 'Project contains audio code. You can also mix dedicated external background music in the audio panel.'
            : 'No embedded audio elements detected.',
    });
    // 9. External URLs & Dependencies
    const externalUrlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
    const externalMatches = combinedCode.match(externalUrlRegex) || [];
    const uniqueUrls = Array.from(new Set(externalMatches)).filter((u) => !u.includes('w3.org') && !u.includes('schema.org'));
    const corsRisks = uniqueUrls.length > 0;
    checks.push({
        id: 'external-dependencies',
        name: 'External Network Dependencies & CDNs',
        detected: corsRisks,
        status: corsRisks ? 'warning' : 'ok',
        details: corsRisks
            ? `Found ${uniqueUrls.length} external URL(s) (e.g. ${uniqueUrls.slice(0, 2).join(', ')}). May cause CORS taint on canvas export if external servers lack Access-Control-Allow-Origin.`
            : 'Project is completely self-contained with no external dependencies.',
    });
    if (corsRisks) {
        warnings.push('External CDN scripts or images detected. If export fails due to CORS, bundle them in a ZIP project.');
    }
    // 10. Missing Assets
    const hasMissingAssets = missingAssets.length > 0;
    checks.push({
        id: 'missing-assets',
        name: 'Missing Project Assets',
        detected: hasMissingAssets,
        status: hasMissingAssets ? 'warning' : 'ok',
        details: hasMissingAssets
            ? `Detected missing assets: ${missingAssets.slice(0, 3).join(', ')}${missingAssets.length > 3 ? '...' : ''}`
            : 'All referenced assets are accounted for.',
    });
    if (hasMissingAssets) {
        warnings.push(`Missing assets: ${missingAssets.join(', ')}`);
    }
    // 11. Extract estimated duration if CSS animations are present
    // Matches e.g. animation: spin 4s linear infinite or animation-duration: 3.5s
    let detectedDuration;
    const durationMatches = Array.from(combinedCode.matchAll(/(?:animation(?:-duration)?\s*:\s*.*?(\d+(?:\.\d+)?)(s|ms))/gi));
    let maxDurationFound = 0;
    for (const m of durationMatches) {
        let dur = parseFloat(m[1]);
        if (m[2].toLowerCase() === 'ms')
            dur /= 1000;
        if (dur > maxDurationFound && dur < 120) {
            maxDurationFound = dur;
        }
    }
    if (maxDurationFound > 0) {
        detectedDuration = maxDurationFound;
    }
    // Overall status evaluation
    let overallStatus = 'ready';
    let summary = 'Project is ready for browser-based video conversion.';
    if (!hasHtml) {
        overallStatus = 'unsupported';
        summary = 'No valid HTML structure found to render.';
    }
    else if (hasWebGL && corsRisks) {
        overallStatus = 'desktop-recommended';
        summary = 'High complexity (WebGL + external resources). Desktop app is recommended for frame-accurate output.';
    }
    else if (hasMissingAssets || corsRisks || hasWebGL) {
        overallStatus = 'limited';
        summary = 'Export is supported with potential limitations (see warnings below).';
    }
    // Strategy recommendation
    let recommendedStrategy = 'webcodecs';
    if (hasWebGL) {
        recommendedStrategy = 'mediarecorder';
    }
    else if (hasCanvas && !hasHtml) {
        recommendedStrategy = 'canvas';
    }
    return {
        overallStatus,
        summary,
        checks,
        detectedFeatures: {
            hasHtml,
            hasCssAnimations,
            hasCssTransitions,
            hasRaf,
            hasCanvas,
            hasSvg,
            hasWebGL,
            hasAudio,
            externalUrls: uniqueUrls,
            missingAssets,
            corsRisks,
        },
        recommendedStrategy,
        warnings,
    };
}
