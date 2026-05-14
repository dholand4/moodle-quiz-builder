import { ViewPlugin, DecorationSet, Decoration, WidgetType, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly id: string,
  ) {
    super();
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.id === this.id;
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.style.cssText = 'display:inline-block;vertical-align:middle;margin:2px 4px;';

    const img = document.createElement('img');
    img.src = this.src;
    img.title = this.id;
    img.style.cssText =
      'max-height:100px;max-width:220px;border-radius:6px;border:1px solid #ffe0b2;cursor:pointer;display:block;';

    wrap.appendChild(img);
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

export function imageInlinePlugin(getImageMap: () => Record<string, string>) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, getImageMap());
      }

      update(update: { docChanged: boolean; viewportChanged: boolean; view: EditorView }) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, getImageMap());
        }
      }
    },
    { decorations: (v) => v.decorations },
  );
}

function buildDecorations(view: EditorView, imageMap: Record<string, string>): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc.toString();
  const regex = /\[imagem(\d+)\]/gi;
  const matches: { index: number; end: number; id: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(doc)) !== null) {
    const id = `imagem${match[1]}`;
    if (imageMap[id]) {
      matches.push({ index: match.index, end: match.index + match[0].length, id });
    }
  }

  // RangeSetBuilder requires ascending order
  matches.sort((a, b) => a.index - b.index);

  for (const { index, end, id } of matches) {
    builder.add(
      index,
      end,
      Decoration.replace({ widget: new ImageWidget(imageMap[id], id) }),
    );
  }

  return builder.finish();
}
