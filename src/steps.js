import { setEditorContent, setDiffHighlight } from './editor.js';

let steps = [];
let currentIndex = 0;
let leftEditor = null;
let onStepChange = null;

export function initSteps(stepsData, editor, callback) {
  steps = stepsData;
  currentIndex = 0;
  leftEditor = editor;
  onStepChange = callback;
  showStep(0);
}

export function showStep(index) {
  if (index < 0 || index >= steps.length) return;
  currentIndex = index;

  const step = steps[currentIndex];
  setEditorContent(leftEditor, step.code);

  const prevCode = currentIndex > 0 ? steps[currentIndex - 1].code : '';
  const diff = computeDiff(prevCode, step.code);

  leftEditor.dispatch({
    effects: setDiffHighlight.of(diff),
  });

  if (onStepChange) {
    onStepChange({
      index: currentIndex,
      total: steps.length,
      explanation: step.explanation,
      hasPrev: currentIndex > 0,
      hasNext: currentIndex < steps.length - 1,
    });
  }
}

export function nextStep() {
  showStep(currentIndex + 1);
}

export function prevStep() {
  showStep(currentIndex - 1);
}

export function getCurrentCode() {
  if (steps.length === 0) return '';
  return steps[currentIndex].code;
}

// LCS-based diff returning { added: Set<line>, modified: Set<line> }
function computeDiff(oldCode, newCode) {
  const oldLines = oldCode ? oldCode.split('\n') : [];
  const newLines = newCode.split('\n');
  const added = new Set();
  const modified = new Set();

  if (oldLines.length === 0) {
    // First step: all non-empty lines are "added"
    for (let i = 0; i < newLines.length; i++) {
      if (newLines[i].trim()) added.add(i + 1);
    }
    return { added, modified };
  }

  // Compute LCS table
  const lcs = computeLCS(oldLines, newLines);

  // Walk the LCS to classify new lines
  let oi = oldLines.length;
  let ni = newLines.length;
  const matched = new Set(); // new line indices that matched (0-based)
  const matchedOld = new Set(); // old line indices that matched

  while (oi > 0 && ni > 0) {
    if (oldLines[oi - 1].trim() === newLines[ni - 1].trim()) {
      matched.add(ni - 1);
      matchedOld.add(oi - 1);
      oi--;
      ni--;
    } else if (lcs[oi - 1][ni] >= lcs[oi][ni - 1]) {
      oi--;
    } else {
      ni--;
    }
  }

  // Unmatched old lines = deleted/replaced lines
  const deletedOldCount = oldLines.length - matchedOld.size;

  // Unmatched new lines: classify as added vs modified
  // Strategy: if there are deleted old lines, the first N unmatched new lines
  // near those positions are "modified"; the rest are "added"
  const unmatchedNew = [];
  for (let i = 0; i < newLines.length; i++) {
    if (!matched.has(i) && newLines[i].trim()) {
      unmatchedNew.push(i);
    }
  }

  // Pair unmatched new lines with deleted old lines as "modified"
  const modifiedCount = Math.min(unmatchedNew.length, deletedOldCount);
  for (let i = 0; i < unmatchedNew.length; i++) {
    if (i < modifiedCount) {
      modified.add(unmatchedNew[i] + 1); // 1-based
    } else {
      added.add(unmatchedNew[i] + 1);
    }
  }

  return { added, modified };
}

function computeLCS(a, b) {
  const m = a.length;
  const n = b.length;
  // Use two rows to save memory
  const table = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].trim() === b[j - 1].trim()) {
        table[i][j] = table[i - 1][j - 1] + 1;
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }
    }
  }
  return table;
}
