const P5_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

const runningPanes = new Set();

export function detectCodeType(code) {
  // p5.js: uses setup/draw, createCanvas, etc.
  if (/\b(setup|draw)\s*\(/.test(code) && /\b(createCanvas|background|ellipse|rect|line|fill|stroke|noFill|noStroke|push|pop)\b/.test(code)) {
    return 'p5';
  }
  // three.js: uses THREE namespace
  if (/\bTHREE\b/.test(code)) {
    return 'three';
  }
  // Raw WebGL: uses gl. calls or getContext('webgl')
  if (/getContext\s*\(\s*['"]webgl/i.test(code) || /\bgl\.(bindBuffer|createShader|shaderSource|compileShader|createProgram|attachShader|linkProgram|useProgram|drawArrays|drawElements)\b/.test(code)) {
    return 'webgl';
  }
  // Default to p5
  return 'p5';
}

function buildHTML(pane, code) {
  const type = detectCodeType(code);
  const errorScript = `
    window.onerror = function(msg, src, line, col, err) {
      parent.postMessage({ type: 'preview-error', pane: '${pane}', message: msg, line: line }, '*');
    };
    window.addEventListener('unhandledrejection', function(e) {
      parent.postMessage({ type: 'preview-error', pane: '${pane}', message: String(e.reason) }, '*');
    });`;

  if (type === 'p5') {
    return `<!DOCTYPE html>
<html><head>
  <style>body { margin: 0; overflow: hidden; background: #000; } canvas { display: block; }</style>
  <script src="${P5_CDN}"><\/script>
</head><body>
  <script>${errorScript}<\/script>
  <script>${code}<\/script>
</body></html>`;
  }

  if (type === 'three') {
    return `<!DOCTYPE html>
<html><head>
  <style>body { margin: 0; overflow: hidden; background: #000; } canvas { display: block; }</style>
  <script src="${THREE_CDN}"><\/script>
</head><body>
  <script>${errorScript}<\/script>
  <script>${code}<\/script>
</body></html>`;
  }

  // Raw WebGL / plain canvas
  return `<!DOCTYPE html>
<html><head>
  <style>body { margin: 0; overflow: hidden; background: #000; } canvas { display: block; width: 100vw; height: 100vh; }</style>
</head><body>
  <canvas id="canvas"></canvas>
  <script>${errorScript}<\/script>
  <script>${code}<\/script>
</body></html>`;
}

export function togglePreview(pane, getCode) {
  if (runningPanes.has(pane)) {
    stopInlinePreview(pane);
  } else {
    runInlinePreview(pane, getCode());
  }
}

function runInlinePreview(pane, code) {
  const container = document.querySelector(`.inline-preview[data-pane="${pane}"]`);
  const frame = container.querySelector('.inline-preview-frame');
  const errorBox = container.querySelector('.preview-error-inline');
  const btn = document.querySelector(`.run-btn[data-pane="${pane}"]`);

  errorBox.classList.add('hidden');
  errorBox.textContent = '';

  frame.srcdoc = buildHTML(pane, code);
  container.classList.remove('hidden');
  runningPanes.add(pane);

  btn.innerHTML = '&#9632; 停止';
  btn.classList.add('run-btn-active');
}

function stopInlinePreview(pane) {
  const container = document.querySelector(`.inline-preview[data-pane="${pane}"]`);
  const frame = container.querySelector('.inline-preview-frame');
  const errorBox = container.querySelector('.preview-error-inline');
  const btn = document.querySelector(`.run-btn[data-pane="${pane}"]`);

  frame.srcdoc = '';
  errorBox.classList.add('hidden');
  container.classList.add('hidden');
  runningPanes.delete(pane);

  btn.innerHTML = '&#9654; 実行';
  btn.classList.remove('run-btn-active');
}

export function initPreview() {
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'preview-error') {
      const container = document.querySelector(`.inline-preview[data-pane="${e.data.pane}"]`);
      if (!container) return;
      const errorBox = container.querySelector('.preview-error-inline');
      const line = e.data.line ? ` (line ${e.data.line})` : '';
      errorBox.textContent = `Error${line}: ${e.data.message}`;
      errorBox.classList.remove('hidden');
    }
  });
}
