import { EditorView, keymap, lineNumbers, highlightActiveLine, Decoration } from '@codemirror/view';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// Effect: { added: Set<number>, modified: Set<number> } (1-based line numbers)
export const setDiffHighlight = StateEffect.define();
export const setErrorHighlight = StateEffect.define();

const addedLineDeco = Decoration.line({ class: 'cm-added-line' });
const modifiedLineDeco = Decoration.line({ class: 'cm-modified-line' });
const errorLineDeco = Decoration.line({ class: 'cm-error-line' });

const highlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const e of tr.effects) {
      if (e.is(setDiffHighlight)) {
        const { added, modified } = e.value;
        const builder = [];
        const doc = tr.state.doc;
        for (const ln of added) {
          if (ln >= 1 && ln <= doc.lines) {
            builder.push(addedLineDeco.range(doc.line(ln).from));
          }
        }
        for (const ln of modified) {
          if (ln >= 1 && ln <= doc.lines) {
            builder.push(modifiedLineDeco.range(doc.line(ln).from));
          }
        }
        builder.sort((a, b) => a.from - b.from);
        return Decoration.set(builder);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const errorField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorHighlight)) {
        const lines = e.value; // Set<number> (1-based)
        if (lines.size === 0) return Decoration.none;
        const builder = [];
        const doc = tr.state.doc;
        for (const ln of lines) {
          if (ln >= 1 && ln <= doc.lines) {
            builder.push(errorLineDeco.range(doc.line(ln).from));
          }
        }
        builder.sort((a, b) => a.from - b.from);
        return Decoration.set(builder);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#c678dd' },
  { tag: tags.controlKeyword, color: '#c678dd' },
  { tag: tags.definition(tags.variableName), color: '#e06c75' },
  { tag: tags.variableName, color: '#e5c07b' },
  { tag: tags.function(tags.variableName), color: '#61afef' },
  { tag: tags.propertyName, color: '#61afef' },
  { tag: tags.function(tags.propertyName), color: '#61afef' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.bool, color: '#d19a66' },
  { tag: tags.operator, color: '#56b6c2' },
  { tag: tags.punctuation, color: '#abb2bf' },
  { tag: tags.comment, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#7f848e', fontStyle: 'italic' },
  { tag: tags.typeName, color: '#e5c07b' },
  { tag: tags.null, color: '#d19a66' },
]);

const baseTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: '#1a1a2e' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { color: '#abb2bf' },
  '.cm-gutters': { backgroundColor: '#16213e', color: '#636d83', borderRight: '1px solid #0f3460' },
  '.cm-activeLineGutter': { backgroundColor: '#0f3460' },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#fff !important', borderLeftWidth: '2px !important' },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#fff !important', borderLeftWidth: '2px !important' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(56, 117, 214, 0.3)' },
  '.cm-matchingBracket': { color: '#fff', backgroundColor: 'rgba(99, 109, 131, 0.4)' },
});

function createExtensions(readOnly) {
  const exts = [
    lineNumbers(),
    highlightActiveLine(),
    history(),
    javascript(),
    syntaxHighlighting(darkHighlight),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    baseTheme,
    highlightField,
    errorField,
  ];
  if (readOnly) {
    exts.push(EditorState.readOnly.of(true));
  }
  return exts;
}

export function createEditor(parent, readOnly = false) {
  const state = EditorState.create({
    doc: '',
    extensions: createExtensions(readOnly),
  });
  const view = new EditorView({ state, parent });
  return view;
}

export function setEditorContent(view, content) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: content },
  });
}

export function getEditorContent(view) {
  return view.state.doc.toString();
}
