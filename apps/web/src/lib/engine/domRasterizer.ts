/**
 * High-fidelity client-side DOM-to-Canvas rasterizer.
 * Safely renders HTML/CSS/SVG templates onto an HTML5 2D Canvas with exact CSS keyframe animation timing.
 */

export interface RasterizeOptions {
  width: number;
  height: number;
  currentTimeSeconds?: number;
  durationSeconds?: number;
  backgroundColor?: string;
}

export async function rasterizeHtmlSnippetToCanvas(
  htmlContent: string,
  canvas: HTMLCanvasElement,
  options: RasterizeOptions
): Promise<boolean> {
  const { width, height, currentTimeSeconds = 0, backgroundColor = '#090d16' } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  let cleanHtml = htmlContent;

  // Extract embedded CSS styles
  let styles = '';
  const styleMatches = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (styleMatches) {
    styles = styleMatches.join('\n');
  }

  // Extract body content or clean HTML
  let bodyContent = cleanHtml;
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }

  // Strip script tags inside foreignObject (scripts cannot execute in an SVG image)
  bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Add deterministic animation time freeze rule so CSS animations step frame-by-frame
  const freezeAnimationRule = `
    <style>
      ${styles}
      *, *::before, *::after {
        animation-delay: -${currentTimeSeconds}s !important;
        animation-play-state: paused !important;
        transition-delay: -${currentTimeSeconds}s !important;
      }
    </style>
  `;

  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;overflow:hidden;position:relative;background:${backgroundColor};color:#ffffff;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;">
          ${freezeAnimationRule}
          ${bodyContent}
        </div>
      </foreignObject>
    </svg>
  `;

  try {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    return await new Promise<boolean>((resolve) => {
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
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
  } catch {
    return false;
  }
}
