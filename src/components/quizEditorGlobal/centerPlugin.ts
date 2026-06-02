import { ViewPlugin, Decoration, DecorationSet, EditorView, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

const ALIGN_RE = /^\{([cj])\}\s*/i;

const hideTag      = Decoration.replace({});
const centeredLine = Decoration.line({ class: 'cm-centered-line' });
const justifiedLine = Decoration.line({ class: 'cm-justified-line' });

export const centerPlugin = () =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) { this.decorations = this.build(view); }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = this.build(update.view);
      }
      build(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        for (const { from, to } of view.visibleRanges) {
          let pos = from;
          while (pos <= to) {
            const line = view.state.doc.lineAt(pos);
            const m = ALIGN_RE.exec(line.text);
            if (m) {
              const tag = m[1].toLowerCase();
              builder.add(line.from, line.from, tag === 'c' ? centeredLine : justifiedLine);
              builder.add(line.from, line.from + m[0].length, hideTag);
            }
            pos = line.to + 1;
          }
        }
        return builder.finish();
      }
    },
    { decorations: (v) => v.decorations },
  );
