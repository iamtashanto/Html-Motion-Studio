export interface SampleTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultDuration: number;
  html: string;
  css?: string;
  js?: string;
  expectedStatus: 'ready' | 'limited' | 'desktop-recommended' | 'unsupported';
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: '1-static-html',
    name: '1. Static HTML Banner',
    category: 'Basic',
    description: 'Clean typographic layout with static elements and gradient background.',
    defaultDuration: 3,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
    }
    .badge {
      background: #6366f1;
      color: white;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 52px;
      font-weight: 800;
      margin: 0 0 12px 0;
      background: linear-gradient(to right, #ffffff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
    }
    p {
      font-size: 20px;
      color: #94a3b8;
      max-width: 500px;
      text-align: center;
      margin: 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="badge">Static Banner</div>
  <h1>HTML Motion Studio</h1>
  <p>High-fidelity browser animation rendered into crisp video output.</p>
</body>
</html>`,
  },
  {
    id: '2-css-keyframes',
    name: '2. CSS Keyframe Motion',
    category: 'CSS Motion',
    description: 'Pulsing rings, floating cards, and looping glowing keyframe gradient.',
    defaultDuration: 4,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #090d16;
      font-family: system-ui, sans-serif;
      overflow: hidden;
    }
    .container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .orb {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, #38bdf8 0%, #3b82f6 50%, #6366f1 100%);
      box-shadow: 0 0 60px rgba(56, 189, 248, 0.6);
      animation: pulse 4s ease-in-out infinite alternate, rotate 8s linear infinite;
    }
    .ring {
      position: absolute;
      top: -20px;
      left: -20px;
      right: -20px;
      bottom: -20px;
      border: 2px dashed rgba(165, 180, 252, 0.4);
      border-radius: 50%;
      animation: spinRing 6s linear infinite;
    }
    h2 {
      margin-top: 36px;
      font-size: 28px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.02em;
      animation: floatText 4s ease-in-out infinite alternate;
    }
    @keyframes pulse {
      0% { transform: scale(0.9); filter: brightness(0.9); }
      100% { transform: scale(1.15); filter: brightness(1.3); }
    }
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes spinRing {
      0% { transform: rotate(0deg) scale(0.95); }
      50% { transform: rotate(180deg) scale(1.05); }
      100% { transform: rotate(360deg) scale(0.95); }
    }
    @keyframes floatText {
      0% { transform: translateY(0); opacity: 0.8; }
      100% { transform: translateY(-8px); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="position: relative;">
      <div class="ring"></div>
      <div class="orb"></div>
    </div>
    <h2>Smooth CSS Keyframes</h2>
  </div>
</body>
</html>`,
  },
  {
    id: '3-css-transition',
    name: '3. CSS Transition Sequencing',
    category: 'CSS Motion',
    description: 'Dynamic CSS transitions with auto-triggering sequence classes.',
    defaultDuration: 5,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #111827;
      font-family: system-ui, sans-serif;
      color: white;
    }
    .bar {
      width: 60px;
      height: 240px;
      background: #374151;
      border-radius: 12px;
      margin: 0 10px;
      display: inline-block;
      overflow: hidden;
      position: relative;
    }
    .fill {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 20%;
      background: #10b981;
      border-radius: 12px;
      transition: height 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 1.2s;
    }
    .fill.active-1 { height: 75%; background: #3b82f6; }
    .fill.active-2 { height: 95%; background: #8b5cf6; }
    .fill.active-3 { height: 50%; background: #ec4899; }
    .fill.active-4 { height: 85%; background: #f59e0b; }
    h3 { margin-bottom: 24px; font-size: 24px; color: #e5e7eb; }
  </style>
</head>
<body>
  <h3>CSS Transitions Automated</h3>
  <div style="display: flex;">
    <div class="bar"><div id="f1" class="fill"></div></div>
    <div class="bar"><div id="f2" class="fill"></div></div>
    <div class="bar"><div id="f3" class="fill"></div></div>
    <div class="bar"><div id="f4" class="fill"></div></div>
  </div>
  <script>
    // Trigger transition classes sequentially for motion demo
    setTimeout(() => document.getElementById('f1').classList.add('active-1'), 400);
    setTimeout(() => document.getElementById('f2').classList.add('active-2'), 800);
    setTimeout(() => document.getElementById('f3').classList.add('active-3'), 1200);
    setTimeout(() => document.getElementById('f4').classList.add('active-4'), 1600);
  </script>
</body>
</html>`,
  },
  {
    id: '4-raf-animation',
    name: '4. requestAnimationFrame Kinetic Motion',
    category: 'JavaScript Motion',
    description: 'Real-time mathematical wave oscillation driven by requestAnimationFrame.',
    defaultDuration: 5,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      background: #020617;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: sans-serif;
    }
    canvas {
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
  </style>
</head>
<body>
  <canvas id="c" width="800" height="500"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let t = 0;
    function draw() {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const points = 60;
      for (let i = 0; i < points; i++) {
        const x = (canvas.width / points) * i + 10;
        const y1 = canvas.height / 2 + Math.sin(t * 0.05 + i * 0.2) * 80;
        const y2 = canvas.height / 2 + Math.cos(t * 0.04 + i * 0.15) * 60;
        ctx.beginPath();
        ctx.arc(x, y1, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(' + ((i * 6 + t * 2) % 360) + ', 85%, 65%)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y2, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }
      t++;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  </script>
</body>
</html>`,
  },
  {
    id: '5-svg-animation',
    name: '5. SVG Vector Path & Stroke Animation',
    category: 'Vector Graphics',
    description: 'SVG geometric morphing, dasharray drawing, and animated gradient fills.',
    defaultDuration: 4,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0f172a;
    }
    svg {
      width: 280px;
      height: 280px;
    }
    .poly {
      fill: none;
      stroke: url(#cyanPurple);
      stroke-width: 6;
      stroke-dasharray: 600;
      stroke-dashoffset: 600;
      animation: draw 4s ease-in-out infinite alternate;
    }
    .glow-dot {
      fill: #38bdf8;
      animation: pulseDot 2s ease-in-out infinite;
    }
    @keyframes draw {
      0% { stroke-dashoffset: 600; transform: rotate(0deg); transform-origin: center; }
      100% { stroke-dashoffset: 0; transform: rotate(180deg); transform-origin: center; }
    }
    @keyframes pulseDot {
      0%, 100% { r: 6px; opacity: 0.6; }
      50% { r: 12px; opacity: 1; }
    }
  </style>
</head>
<body>
  <svg viewBox="0 0 200 200">
    <defs>
      <linearGradient id="cyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#c084fc" />
      </linearGradient>
    </defs>
    <polygon class="poly" points="100,20 180,75 180,160 100,190 20,160 20,75" />
    <circle class="glow-dot" cx="100" cy="105" r="8" />
  </svg>
</body>
</html>`,
  },
  {
    id: '6-canvas-particles',
    name: '6. HTML5 Canvas Dynamic Particle System',
    category: 'Canvas 2D',
    description: 'Explosive particle physics simulation in native HTML5 2D canvas.',
    defaultDuration: 5,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: #000; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    for(let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 4 + 2,
        hue: Math.random() * 60 + 190
      });
    }
    function render() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(' + p.hue + ', 100%, 65%)';
        ctx.shadowColor = 'hsl(' + p.hue + ', 100%, 50%)';
        ctx.shadowBlur = 12;
        ctx.fill();
      });
      requestAnimationFrame(render);
    }
    render();
  </script>
</body>
</html>`,
  },
  {
    id: '7-local-images',
    name: '7. Local Embedded Images & Assets',
    category: 'Assets',
    description: 'Inline data URI images and assets animated across the frame.',
    defaultDuration: 4,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #18181b;
      font-family: sans-serif;
      color: white;
    }
    .badge-icon {
      width: 100px;
      height: 100px;
      animation: bounce 2s infinite alternate ease-in-out;
    }
    @keyframes bounce {
      0% { transform: translateY(-20px) rotate(-6deg); }
      100% { transform: translateY(20px) rotate(6deg); }
    }
  </style>
</head>
<body>
  <!-- SVG data URI representing local vector asset -->
  <img class="badge-icon" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'></polygon></svg>" alt="Star" />
  <h2 style="margin-top: 24px;">Local Asset Embedding Test</h2>
  <p style="color: #a1a1aa;">Self-contained offline assets render deterministically</p>
</body>
</html>`,
  },
  {
    id: '8-local-fonts',
    name: '8. Local Typography & Font Face',
    category: 'Typography',
    description: 'Custom CSS typography styling, tracking animations, and bold titles.',
    defaultDuration: 4,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      color: #f8fafc;
      font-family: 'Courier New', Courier, monospace;
    }
    .title {
      font-size: 40px;
      font-weight: bold;
      letter-spacing: 4px;
      animation: letterTrack 3s ease-in-out infinite alternate;
      border-bottom: 3px solid #38bdf8;
      padding-bottom: 8px;
    }
    @keyframes letterTrack {
      0% { letter-spacing: 2px; }
      100% { letter-spacing: 12px; }
    }
  </style>
</head>
<body>
  <div class="title">HTML MOTION</div>
  <p style="margin-top: 16px; opacity: 0.7;">Typography rendering test</p>
</body>
</html>`,
  },
  {
    id: '9-external-resources',
    name: '9. External Resources & CDN Notice',
    category: 'Warnings',
    description: 'Demonstrates compatibility warnings triggered by external CDN URLs.',
    defaultDuration: 4,
    expectedStatus: 'limited',
    html: `<!DOCTYPE html>
<html>
<head>
  <!-- External Google Font and CDN stylesheet -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #27272a;
      font-family: 'Inter', sans-serif;
      color: #fafafa;
    }
    .card {
      background: #3f3f46;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #71717a;
      text-align: center;
      animation: float 3s ease-in-out infinite alternate;
    }
    @keyframes float {
      0% { transform: translateY(0); }
      100% { transform: translateY(-12px); }
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>External CDN Resource Demo</h2>
    <p>Notice the compatibility scanner highlights external dependencies.</p>
  </div>
</body>
</html>`,
  },
  {
    id: '10-audio-visualizer',
    name: '10. Audio Synced Visualizer',
    category: 'Audio',
    description: 'Animated equalizer bars ready to sync with background music track.',
    defaultDuration: 5,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #030712;
      font-family: system-ui, sans-serif;
      color: white;
    }
    .eq-container {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 120px;
    }
    .eq-bar {
      width: 14px;
      background: linear-gradient(to top, #06b6d4, #3b82f6);
      border-radius: 6px;
      animation: eqBounce 0.8s ease-in-out infinite alternate;
    }
    .eq-bar:nth-child(1) { height: 40px; animation-delay: 0.1s; }
    .eq-bar:nth-child(2) { height: 80px; animation-delay: 0.3s; }
    .eq-bar:nth-child(3) { height: 110px; animation-delay: 0.15s; }
    .eq-bar:nth-child(4) { height: 60px; animation-delay: 0.4s; }
    .eq-bar:nth-child(5) { height: 95px; animation-delay: 0.25s; }
    .eq-bar:nth-child(6) { height: 70px; animation-delay: 0.35s; }
    .eq-bar:nth-child(7) { height: 50px; animation-delay: 0.05s; }
    @keyframes eqBounce {
      0% { height: 20px; }
      100% { height: 110px; }
    }
  </style>
</head>
<body>
  <div class="eq-container">
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
    <div class="eq-bar"></div>
  </div>
  <h3 style="margin-top: 24px;">Audio Visualizer Template</h3>
  <p style="color: #6b7280; margin: 0;">Upload an MP3/WAV in the Audio panel to mux sound!</p>
</body>
</html>`,
  },
  {
    id: '11-long-running',
    name: '11. Long-Running Animation (15s)',
    category: 'Duration',
    description: 'Extended progression bar and timer to test longer browser encoding.',
    defaultDuration: 15,
    expectedStatus: 'ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      font-family: system-ui, sans-serif;
      color: white;
    }
    .track {
      width: 400px;
      height: 16px;
      background: #1e293b;
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 20px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
    }
    .progress {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      border-radius: 9999px;
      animation: fillBar 15s linear forwards;
    }
    @keyframes fillBar {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  </style>
</head>
<body>
  <h2>15-Second Continuous Motion</h2>
  <div class="track">
    <div class="progress"></div>
  </div>
  <p style="color: #94a3b8; margin-top: 16px;">Testing multi-second frame encoding stability</p>
</body>
</html>`,
  },
  {
    id: '12-unsupported-webgl',
    name: '12. Unsupported / Heavy WebGL Scene',
    category: 'Desktop Recommended',
    description: 'Heavy WebGL context trigger testing Desktop App recommendation prompt.',
    defaultDuration: 5,
    expectedStatus: 'desktop-recommended',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; }
    .notice {
      position: absolute;
      top: 20px;
      left: 20px;
      color: #facc15;
      font-family: sans-serif;
      background: rgba(0,0,0,0.7);
      padding: 10px 16px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="notice">Heavy 3D WebGL Context (Desktop App Recommended)</div>
  <canvas id="glcanvas"></canvas>
  <script>
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      function renderGL() {
        gl.clearColor(0.1, 0.1, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        requestAnimationFrame(renderGL);
      }
      renderGL();
    }
  </script>
</body>
</html>`,
  },
];

