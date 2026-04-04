import { EditorView, keymap, lineNumbers, highlightActiveLine, Decoration } from '@codemirror/view';
import { EditorState, StateField, StateEffect, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { autocompletion, acceptCompletion } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
import { getCompletionSource } from './completions.js';

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
  { tag: tags.keyword, color: '#ff00ff' },
  { tag: tags.controlKeyword, color: '#ff00ff' },
  { tag: tags.definition(tags.variableName), color: '#ff0000' },
  { tag: tags.variableName, color: '#000' },
  { tag: tags.function(tags.variableName), color: '#0000ff' },
  { tag: tags.propertyName, color: '#0000ff' },
  { tag: tags.function(tags.propertyName), color: '#0000ff' },
  { tag: tags.string, color: '#00aa00' },
  { tag: tags.number, color: '#ff8800' },
  { tag: tags.bool, color: '#ff8800' },
  { tag: tags.operator, color: '#ff0000' },
  { tag: tags.punctuation, color: '#888' },
  { tag: tags.comment, color: '#bbb', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#bbb', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#bbb', fontStyle: 'italic' },
  { tag: tags.typeName, color: '#ff8800' },
  { tag: tags.null, color: '#ff8800' },
]);

const baseTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: '#ffffff', fontFamily: "'Roboto Mono', Menlo, Consolas, monospace" },
  '.cm-scroller': { overflow: 'auto', lineHeight: '1.65' },
  '.cm-content': { color: '#1a1a1a', padding: '4px 0', fontWeight: '450' },
  '.cm-gutters': { backgroundColor: '#fafafa', color: '#bbb', borderRight: '1px solid #e8e8e8' },
  '.cm-activeLineGutter': { backgroundColor: '#f0f0f0', color: '#888' },
  '.cm-activeLine': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#1a1a1a !important', borderLeftWidth: '1.5px !important' },
  '&.cm-focused .cm-cursor': { borderLeftColor: '#1a1a1a !important', borderLeftWidth: '1.5px !important' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
  '.cm-matchingBracket': { color: '#1a1a1a', backgroundColor: 'rgba(0, 0, 0, 0.06)' },
});

const autocompleteCompartment = new Compartment();

function createExtensions(readOnly) {
  const exts = [
    lineNumbers(),
    highlightActiveLine(),
    history(),
    javascript(),
    syntaxHighlighting(darkHighlight),
    keymap.of([{ key: 'Tab', run: acceptCompletion }, ...defaultKeymap, ...historyKeymap]),
    baseTheme,
    highlightField,
    errorField,
    autocompleteCompartment.of([]),
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

export function setCodeType(view, codeType) {
  view.dispatch({
    effects: autocompleteCompartment.reconfigure(
      autocompletion({
        override: [getCompletionSource(codeType)],
        activateOnTyping: true,
      })
    ),
  });
}

export function setEditorContent(view, content) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: content },
  });
}

export function getEditorContent(view) {
  return view.state.doc.toString();
}
