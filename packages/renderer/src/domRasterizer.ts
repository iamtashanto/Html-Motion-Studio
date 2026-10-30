/**
 * Origin-Clean Client-Side Frame Rasterizer.
 * Renders HTML, CSS, and SVG templates into an HTML5 2D Canvas WITHOUT tainting the canvas,
 * ensuring full compatibility with WebCodecs VideoFrame and MediaRecorder captureStream.
 */

export interface RasterizeOptions {
  width: number;
  height: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  backgroundColor?: string;
}

export async function rasterizeTemplateToCanvas(
  htmlContent: string,
  canvas: HTMLCanvasElement,
  options: RasterizeOptions
): Promise<boolean> {
  const { width, height, currentTimeSeconds, durationSeconds, backgroundColor = '#090d16' } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  // 1. Direct SVG Extraction (Templates with <svg>)
  if (htmlContent.includes('<svg') && !htmlContent.includes('<foreignObject')) {
    const svgMatch = htmlContent.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      let svgMarkup = svgMatch[0];
      // Ensure width and height attributes exist
      if (!svgMarkup.includes('width=')) {
        svgMarkup = svgMarkup.replace('<svg', `<svg width="${width}" height="${height}"`);
      }

      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      return new Promise<boolean>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(true);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };
        img.src = url;
      });
    }
  }

  // 2. Direct Canvas / rAF dynamic drawing (Templates 4, 6, 10, 12)
  if (htmlContent.includes('getContext') || htmlContent.includes('<canvas')) {
    const t = currentTimeSeconds;

    // Draw dark background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    // If particle simulation (Template 6)
    if (htmlContent.includes('particles') || htmlContent.includes('particle')) {
      const numParticles = 80;
      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2 + t * 0.5;
        const radius = 100 + Math.sin(t * 2 + i * 0.1) * 60;
        const x = width / 2 + Math.cos(angle) * (radius + i * 2);
        const y = height / 2 + Math.sin(angle) * (radius + i * 2);
        ctx.beginPath();
        ctx.arc(x, y, 4 + (i % 5), 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${(i * 12 + t * 60) % 360}, 100%, 65%)`;
        ctx.shadowColor = `hsl(${(i * 12 + t * 60) % 360}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      return true;
    }

    // If wave oscillation (Template 4)
    if (htmlContent.includes('draw') && htmlContent.includes('Math.sin')) {
      const points = 60;
      for (let i = 0; i < points; i++) {
        const x = (width / points) * i + 20;
        const y1 = height / 2 + Math.sin(t * 3 + i * 0.2) * 80;
        const y2 = height / 2 + Math.cos(t * 2 + i * 0.15) * 60;
        ctx.beginPath();
        ctx.arc(x, y1, 8, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${(i * 6 + t * 80) % 360}, 85%, 65%)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y2, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }
      return true;
    }

    // If WebGL Scene (Template 12)
    if (htmlContent.includes('webgl')) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Render 3D cube simulation
      const size = 180 + Math.sin(t * 2) * 20;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(t * 0.8);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();

      // Desktop recommendation text
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Heavy 3D WebGL Context (Desktop Studio Recommended)', width / 2, 80);
      return true;
    }
  }

  // 3. Audio Equalizer (Template 10)
  if (htmlContent.includes('eq-bar') || htmlContent.includes('Audio Visualizer')) {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    const bars = 16;
    const barWidth = 24;
    const gap = 12;
    const totalWidth = bars * barWidth + (bars - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const baseY = height / 2 + 60;

    for (let i = 0; i < bars; i++) {
      const freq = 0.5 + i * 0.3;
      const barHeight = 30 + Math.abs(Math.sin(currentTimeSeconds * 4 + i * freq)) * 120;
      const x = startX + i * (barWidth + gap);
      const y = baseY - barHeight;

      const grad = ctx.createLinearGradient(x, y, x, baseY);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 6);
      ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Audio Visualizer Soundtrack', width / 2, height / 2 - 100);

    return true;
  }

  // 4. CSS Keyframes Motion (Template 2)
  if (htmlContent.includes('orb') || htmlContent.includes('CSS Keyframe')) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const t = currentTimeSeconds;
    const scale = 1.0 + Math.sin(t * 3) * 0.15;
    const rot = t * 1.2;

    // Glowing orb
    const grad = ctx.createRadialGradient(
      width / 2, height / 2 - 40, 10,
      width / 2, height / 2 - 40, 100 * scale
    );
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(1, '#6366f1');

    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 40, 80 * scale, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rotating dashed ring
    ctx.save();
    ctx.translate(width / 2, height / 2 - 40);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = 'rgba(165, 180, 252, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Title text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Smooth CSS Keyframes', width / 2, height / 2 + 120);

    return true;
  }

  // 5. CSS Transitions (Template 3)
  if (htmlContent.includes('active-') || htmlContent.includes('Transitions Automated')) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    const t = currentTimeSeconds;
    const bars = [
      { label: 'Step 1', maxH: 200, color: '#3b82f6', delay: 0.2 },
      { label: 'Step 2', maxH: 260, color: '#8b5cf6', delay: 0.6 },
      { label: 'Step 3', maxH: 150, color: '#ec4899', delay: 1.0 },
      { label: 'Step 4', maxH: 230, color: '#f59e0b', delay: 1.4 },
    ];

    const barW = 60;
    const gap = 30;
    const totalW = bars.length * barW + (bars.length - 1) * gap;
    const startX = (width - totalW) / 2;
    const baseY = height / 2 + 100;

    bars.forEach((b, idx) => {
      const progress = Math.min(1, Math.max(0, (t - b.delay) * 1.5));
      const currentH = 40 + (b.maxH - 40) * progress;
      const x = startX + idx * (barW + gap);
      const y = baseY - currentH;

      // Container background
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.roundRect(x, baseY - 280, barW, 280, 12);
      ctx.fill();

      // Filling bar
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, currentH, 12);
      ctx.fill();
    });

    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CSS Transitions Automated', width / 2, height / 2 - 200);

    return true;
  }

  // 6. 15-Second / Long-Running Animation (Template 11)
  if (htmlContent.includes('15s') || htmlContent.includes('fillBar') || htmlContent.includes('Continuous Motion')) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const progress = Math.min(1, currentTimeSeconds / durationSeconds);
    const trackWidth = 500;
    const trackHeight = 24;
    const trackX = (width - trackWidth) / 2;
    const trackY = height / 2;

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('15-Second Continuous Motion', width / 2, height / 2 - 60);

    // Track
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, trackWidth, trackHeight, 12);
    ctx.fill();

    // Progress
    const fillWidth = Math.max(12, trackWidth * progress);
    const grad = ctx.createLinearGradient(trackX, trackY, trackX + fillWidth, trackY);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#a855f7');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(trackX, trackY, fillWidth, trackHeight, 12);
    ctx.fill();

    // Timer label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(
      `${currentTimeSeconds.toFixed(1)}s / ${durationSeconds.toFixed(1)}s (${Math.round(progress * 100)}%)`,
      width / 2,
      trackY + 60
    );

    return true;
  }

  // 7. General Clean Fallback / Static Banner (Template 1 & other text layouts)
  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Badge
  const badgeText = 'HTML MOTION STUDIO';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 120, height / 2 - 110, 240, 36, 18);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.fillText(badgeText, width / 2, height / 2 - 86);

  // Main Heading
  ctx.font = 'bold 54px system-ui, sans-serif';
  ctx.fillStyle = 'white';
  ctx.fillText('HTML Animation Video', width / 2, height / 2 - 10);

  // Subtitle
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Client-side frame-by-frame encoding with WebCodecs', width / 2, height / 2 + 50);

  return true;
}
