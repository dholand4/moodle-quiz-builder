import { ViewPlugin, DecorationSet, Decoration, WidgetType, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

class EmptyWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span');
    span.style.cssText = 'display:none;';
    return span;
  }
  eq() { return true; }
}

const HIDDEN = Decoration.replace({ widget: new EmptyWidget() });
const BOLD   = Decoration.mark({ class: 'cm-bold-text' });
const CODE   = Decoration.mark({ class: 'cm-code-text' });

export function boldPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = build(view);
      }

      update(update: { docChanged: boolean; viewportChanged: boolean; view: EditorView }) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = build(update.view);
        }
      }
    },
    { decorations: (v) => v.decorations },
  );
}

function build(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc.toString();

  type Span = { from: number; textFrom: number; textTo: number; to: number; kind: 'bold' | 'code' };
  const spans: Span[] = [];

  const boldRegex = /\*\*([^*\n]+)\*\*/g;
  const codeRegex = /`([^`\n]+)`/g;
  let m: RegExpExecArray | null;

  while ((m = boldRegex.exec(doc)) !== null) {
    spans.push({ from: m.index, textFrom: m.index + 2, textTo: m.index + m[0].length - 2, to: m.index + m[0].length, kind: 'bold' });
  }
  while ((m = codeRegex.exec(doc)) !== null) {
    spans.push({ from: m.index, textFrom: m.index + 1, textTo: m.index + m[0].length - 1, to: m.index + m[0].length, kind: 'code' });
  }

  spans.sort((a, b) => a.from - b.from);

  let lastTo = -1;
  for (const { from, textFrom, textTo, to, kind } of spans) {
    if (from < lastTo) continue; // skip overlapping spans — first one wins
    builder.add(from, textFrom, HIDDEN);
    builder.add(textFrom, textTo, kind === 'bold' ? BOLD : CODE);
    builder.add(textTo, to, HIDDEN);
    lastTo = to;
  }

  return builder.finish();
}

// Converte HTML do clipboard (bold/strong) para sintaxe *...*
function htmlToQuizText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return nodeToText(doc.body).trim();
}

function nodeToText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(nodeToText).join('');

    if (tag === 'b' || tag === 'strong') return `**${inner}**`;
    if (tag === 'span') {
      const fw = (el as HTMLElement).style?.fontWeight;
      if (fw === 'bold' || fw === '700') return `**${inner}**`;
    }
    if (tag === 'br') return '\n';
    if (tag === 'p' || tag === 'div') return inner + '\n\n';
    if (tag === 'li') return inner + '\n\n';
    return inner;
  }
  return '';
}

export function htmlPasteExtension() {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const html = event.clipboardData?.getData('text/html');
      if (!html || !/<b\b|<strong\b|font-weight\s*:\s*(bold|700)/i.test(html)) return false;

      event.preventDefault();
      const text = htmlToQuizText(html);
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      return true;
    },
  });
}
