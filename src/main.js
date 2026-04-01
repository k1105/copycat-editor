import { createEditor, getEditorContent, setEditorContent } from './editor.js';
import { analyzeCode } from './analyzer.js';
import { initSteps, nextStep, prevStep, getCurrentCode } from './steps.js';
import { togglePreview, initPreview, detectCodeType } from './preview.js';
import { initSettings, getApiKey, getProvider, getModel } from './settings.js';
import { debugSamples } from './debug-data.js';

// DOM elements
const inputMode = document.getElementById('input-mode');
const loadingMode = document.getElementById('loading-mode');
const editorMode = document.getElementById('editor-mode');
const codeInput = document.getElementById('code-input');
const startBtn = document.getElementById('start-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const stepIndicator = document.getElementById('step-indicator');
const explanation = document.getElementById('explanation');
const runBtnLeft = document.querySelector('.run-btn[data-pane="left"]');
const runBtnRight = document.querySelector('.run-btn[data-pane="right"]');

// Init modules
initSettings();
initPreview();

// Create editors (lazy, after mode switch)
let leftEditor = null;
let rightEditor = null;

function initEditors() {
  if (!leftEditor) {
    leftEditor = createEditor(document.getElementById('left-editor'), true);
    rightEditor = createEditor(document.getElementById('right-editor'), false);
  }
}

// Show mode
function showMode(mode) {
  inputMode.classList.toggle('hidden', mode !== 'input');
  loadingMode.classList.toggle('hidden', mode !== 'loading');
  editorMode.classList.toggle('hidden', mode !== 'editor');
}

const TYPE_LABELS = { p5: 'p5.js', three: 'Three.js', webgl: 'WebGL' };

function showCodeTypeBadge(code) {
  const badge = document.getElementById('code-type-badge');
  const type = detectCodeType(code);
  badge.textContent = TYPE_LABELS[type] || type;
  badge.className = `code-type-badge type-${type}`;
}

// Step callback
function onStepUpdate(info) {
  stepIndicator.textContent = `Step ${info.index + 1} / ${info.total}`;
  explanation.textContent = info.explanation;
  prevBtn.disabled = !info.hasPrev;
  nextBtn.disabled = !info.hasNext;
}

// Debug mode: ?debug or ?debug=three or ?debug=webgl
const debugParam = new URLSearchParams(location.search).get('debug');

if (debugParam !== null) {
  const sampleKey = debugParam || 'p5';
  const steps = debugSamples[sampleKey] || debugSamples.p5;
  showMode('editor');
  initEditors();
  initSteps(steps, leftEditor, onStepUpdate);
  showCodeTypeBadge(steps[0].code);
}

// Start button
startBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim();
  if (!code) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    alert('Settings からAPIキーを設定してください');
    return;
  }

  showMode('loading');

  try {
    const steps = await analyzeCode(code, apiKey, getProvider(), getModel());
    showMode('editor');
    initEditors();
    initSteps(steps, leftEditor, onStepUpdate);
    showCodeTypeBadge(steps[0].code);
  } catch (err) {
    console.error(err);
    alert(`解析に失敗しました: ${err.message}`);
    showMode('input');
  }
});

// Step navigation
prevBtn.addEventListener('click', prevStep);
nextBtn.addEventListener('click', nextStep);

// Preview buttons
runBtnLeft.addEventListener('click', () => {
  togglePreview('left', () => getCurrentCode());
});

runBtnRight.addEventListener('click', () => {
  togglePreview('right', () => rightEditor ? getEditorContent(rightEditor) : '');
});
