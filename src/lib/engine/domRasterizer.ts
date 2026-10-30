/**
 * High-fidelity client-side DOM-to-Canvas rasterizer.
 * Safely renders HTML/CSS/SVG templates onto an HTML5 2D Canvas without breaching sandbox boundaries.
 */

export interface RasterizeOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

export async function rasterizeHtmlSnippetToCanvas(
  htmlContent: string,
  canvas: HTMLCanvasElement,
  options: RasterizeOptions
): Promise<boolean> {
  const { width, height, backgroundColor = '#090d16' } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  // Prepare clean HTML payload for SVG foreignObject
  let cleanHtml = htmlContent;

  // If complete HTML document, extract inner body or style + content
  if (cleanHtml.includes('<html')) {
    const styleMatches = cleanHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const styles = styleMatches.join('\n');
    const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : cleanHtml;
    cleanHtml = `${styles}\n<div style="width:100%;height:100%;box-sizing:border-box;">${bodyContent}</div>`;
  }

  // Construct SVG foreignObject container
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <style>
      * { box-sizing: border-box; }
    </style>
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;margin:0;padding:0;overflow:hidden;background:${backgroundColor};">
        ${cleanHtml}
      </div>
    </foreignObject>
  </svg>`;

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  return new Promise<boolean>((resolve) => {
    img.onload = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback: fill clean background so video frame is not corrupt
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      resolve(false);
    };

    img.src = url;
  });
}

