import { createEditor, getEditorContent, setEditorContent, setErrorHighlight, setCodeType } from './editor.js';
import { analyzeCode } from './analyzer.js';
import { initSteps, nextStep, prevStep, getCurrentCode } from './steps.js';
import { togglePreview, initPreview, detectCodeType } from './preview.js';
import { initSettings, getApiKey, getProvider, getModel } from './settings.js';
import { debugSamples } from './debug-data.js';
import { showFeedback } from './feedback.js';

// DOM elements
const loadingOverlay = document.getElementById('loading-overlay');
const startBtn = document.getElementById('start-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const stepIndicator = document.getElementById('step-indicator');
const explanation = document.getElementById('explanation');
const finishBtn = document.getElementById('finish-btn');
const runBtnLeft = document.querySelector('.run-btn[data-pane="left"]');
const runBtnRight = document.querySelector('.run-btn[data-pane="right"]');
const rightPaneActions = document.getElementById('right-pane-actions');
const stepNav = document.querySelector('.step-nav');

// Init modules
initSettings();
initPreview();

// Both editors are created immediately
const leftEditor = createEditor(document.getElementById('left-editor'), false);
const rightEditor = createEditor(document.getElementById('right-editor'), false);

// Initial placeholder content
setEditorContent(leftEditor, '// ここに写経したいコードを貼り付けてください\n');
setEditorContent(rightEditor, [
  '//    /\\_/\\',
  '//   ( o.o )',
  '//    > ^ <',
  '//   /|   |\\',
  '//  (_|   |_)',
  '//',
  '//  Copycat Editor',
  '//  左側にコードを貼り付けて、写経を始めよう',
  '',
].join('\n'));

// Store for feedback
let currentInputCode = '';
let currentSteps = [];

// After analysis: left becomes read-only, show controls, clear right editor
function switchToStepMode() {
  startBtn.classList.add('hidden');
  runBtnLeft.classList.remove('hidden');
  rightPaneActions.classList.remove('hidden');
  explanation.classList.remove('hidden');
  stepNav.classList.remove('hidden');
  setEditorContent(rightEditor, '');
}

const TYPE_LABELS = { p5: 'p5.js', three: 'Three.js', webgl: 'WebGL' };

function showCodeTypeBadge(code) {
  const badge = document.getElementById('code-type-badge');
  const type = detectCodeType(code);
  badge.textContent = TYPE_LABELS[type] || type;
  badge.className = `code-type-badge type-${type}`;
  setCodeType(rightEditor, type);
}

// Step callback
function onStepUpdate(info) {
  stepIndicator.textContent = `Step ${info.index + 1} / ${info.total}`;
  explanation.textContent = info.explanation;
  prevBtn.disabled = !info.hasPrev;
  nextBtn.disabled = !info.hasNext;
  finishBtn.classList.toggle('hidden', info.hasNext);
}

// Debug mode: ?debug or ?debug=three or ?debug=webgl
const debugParam = new URLSearchParams(location.search).get('debug');

if (debugParam !== null) {
  const sampleKey = debugParam || 'p5';
  const steps = debugSamples[sampleKey] || debugSamples.p5;
  currentInputCode = steps[steps.length - 1].code;
  currentSteps = steps;
  switchToStepMode();
  initSteps(steps, leftEditor, onStepUpdate);
  showCodeTypeBadge(steps[0].code);
}

// Start button
startBtn.addEventListener('click', async () => {
  const code = getEditorContent(leftEditor).trim();
  if (!code) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    alert('Settings からAPIキーを設定してください');
    return;
  }

  loadingOverlay.classList.remove('hidden');

  try {
    const steps = await analyzeCode(code, apiKey, getProvider(), getModel());
    currentInputCode = code;
    currentSteps = steps;
    loadingOverlay.classList.add('hidden');
    switchToStepMode();
    initSteps(steps, leftEditor, onStepUpdate);
    showCodeTypeBadge(steps[0].code);
  } catch (err) {
    console.error(err);
    loadingOverlay.classList.add('hidden');
    alert(`解析に失敗しました: ${err.message}`);
  }
});

// Step navigation
prevBtn.addEventListener('click', prevStep);
nextBtn.addEventListener('click', nextStep);

// Finish → show feedback
finishBtn.addEventListener('click', () => {
  showFeedback(currentInputCode, currentSteps);
});

// Check button: diff user code vs correct code
const checkBtn = document.getElementById('check-btn');
checkBtn.addEventListener('click', () => {
  const correctCode = getCurrentCode();
  const userCode = getEditorContent(rightEditor);
  const correctLines = correctCode.split('\n');
  const userLines = userCode.split('\n');
  const errorLines = new Set();

  const maxLen = Math.max(correctLines.length, userLines.length);
  for (let i = 0; i < maxLen; i++) {
    const normalize = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const correct = normalize(correctLines[i]);
    const user = normalize(userLines[i]);
    if (correct !== user) {
      errorLines.add(i + 1);
    }
  }

  rightEditor.dispatch({ effects: setErrorHighlight.of(errorLines) });

  if (errorLines.size === 0) {
    checkBtn.textContent = '\u2713 OK!';
  } else {
    checkBtn.textContent = `\u2713 ${errorLines.size}箇所`;
  }
  setTimeout(() => { checkBtn.textContent = '\u2713 チェック'; }, 2000);
});

// Preview buttons
runBtnLeft.addEventListener('click', () => {
  togglePreview('left', () => getCurrentCode());
});

runBtnRight.addEventListener('click', () => {
  togglePreview('right', () => getEditorContent(rightEditor));
});
