import { forwardRef, useImperativeHandle, useRef, useCallback, useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { lineNumbers, EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { search, openSearchPanel } from '@codemirror/search';
import { quizLanguage } from './quizLanguage';
import { imageInlinePlugin } from './imagePlugin';
import { boldPlugin, htmlPasteExtension } from './boldPlugin';
import * as S from './style';

const makeTemplate = (n: number) =>
  `${n}. Enunciado da questão\na) Alternativa A\nb) Alternativa B\nc) Alternativa C\nd) Alternativa D {correto}\n`;

export interface QuizEditorHandle {
  getValue: () => string;
  setValue: (text: string) => void;
  insertAtCursor: (text: string) => void;
  focus: () => void;
  refreshDecorations: () => void;
  triggerImageUpload: () => void;
  insertTemplate: () => void;
  openSearch: () => void;
  wrapBold: () => void;
  scrollToQuestion: (identifier: string) => void;
}

interface IQuizEditorProps {
  defaultValue?: string;
  isDragOver?: boolean;
  imageMapRef?: React.MutableRefObject<Record<string, string>>;
  onChange?: (value: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onImageUpload?: (file: File) => void;
  onFileImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const quizEditorGlobal = forwardRef<QuizEditorHandle, IQuizEditorProps>(
  (
    {
      defaultValue = '',
      isDragOver,
      imageMapRef,
      onChange,
      onDragOver,
      onDragLeave,
      onDrop,
      onImageUpload,
      onFileImport: _onFileImport,
    },
    ref,
  ) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const getView = () => cmRef.current?.view ?? null;

    useImperativeHandle(ref, () => ({
      getValue() { return getView()?.state.doc.toString() ?? ''; },
      setValue(text: string) {
        const view = getView();
        if (!view) return;
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
      },
      insertAtCursor(text: string) {
        const view = getView();
        if (!view) return;
        const { from, to } = view.state.selection.main;
        view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length } });
        view.focus();
      },
      focus() { getView()?.focus(); },
      refreshDecorations() { getView()?.dispatch({}); },
      triggerImageUpload() { imageInputRef.current?.click(); },
      scrollToQuestion(identifier: string) {
        const view = getView();
        if (!view) return;
        // identifier is "Q1", "Q2", … — extract the 1-based index
        const num = parseInt(identifier.replace(/\D/g, ''), 10);
        if (isNaN(num) || num < 1) return;
        const text = view.state.doc.toString();
        // find all question header positions (same regex as xmlParser)
        const matches = [...text.matchAll(/^(?:quest[ãa]o\s*)?\d+\s*[.\-]?\s*/gim)];
        const target = matches[num - 1];
        if (!target || target.index === undefined) return;
        view.dispatch({ effects: EditorView.scrollIntoView(target.index, { y: 'start', yMargin: 24 }) });
        view.focus();
      },
      insertTemplate,
      openSearch,
      wrapBold,
    }));

    const insertTemplate = useCallback(() => {
      const view = getView();
      if (!view) return true;
      const { from, to } = view.state.selection.main;
      const doc = view.state.doc.toString();
      const nums = [...doc.matchAll(/^(\d+)\./gm)].map((m) => parseInt(m[1], 10));
      const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
      const prefix = from > 0 && doc[from - 1] !== '\n' ? '\n\n' : '';
      const insert = prefix + makeTemplate(next);
      view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } });
      return true;
    }, []);

    const openSearch = useCallback(() => {
      const view = getView();
      if (!view) return false;
      openSearchPanel(view);
      return true;
    }, []);

    const wrapBold = useCallback(() => {
      const view = getView();
      if (!view) return true;
      const { from, to } = view.state.selection.main;
      const doc = view.state.doc.toString();

      if (from === to) {
        // Sem seleção: verifica se cursor está dentro de **...**
        const line = view.state.doc.lineAt(from);
        const lineText = doc.slice(line.from, line.to);
        const cursorInLine = from - line.from;
        const regex = /\*\*([^*\n]+)\*\*/g;
        let m: RegExpExecArray | null;
        let toggled = false;
        while ((m = regex.exec(lineText)) !== null) {
          if (cursorInLine >= m.index && cursorInLine <= m.index + m[0].length) {
            const absFrom = line.from + m.index;
            const absTo = absFrom + m[0].length;
            const inner = m[1];
            view.dispatch({
              changes: { from: absFrom, to: absTo, insert: inner },
              selection: { anchor: absFrom + inner.length },
            });
            toggled = true;
            break;
          }
        }
        if (!toggled) {
          const placeholder = '**negrito**';
          view.dispatch({
            changes: { from, insert: placeholder },
            selection: { anchor: from + 2, head: from + placeholder.length - 2 },
          });
        }
      } else {
        const selected = view.state.doc.sliceString(from, to);
        // Seleção já contém os ** (ex: selecionou **texto**)
        if (selected.startsWith('**') && selected.endsWith('**') && selected.length > 4) {
          const inner = selected.slice(2, -2);
          view.dispatch({
            changes: { from, to, insert: inner },
            selection: { anchor: from, head: from + inner.length },
          });
        // Seleção está cercada por ** externos
        } else if (from >= 2 && to + 2 <= doc.length && doc.slice(from - 2, from) === '**' && doc.slice(to, to + 2) === '**') {
          view.dispatch({
            changes: [{ from: to, to: to + 2, insert: '' }, { from: from - 2, to: from, insert: '' }],
            selection: { anchor: from - 2, head: to - 2 },
          });
        } else {
          view.dispatch({
            changes: { from, to, insert: `**${selected}**` },
            selection: { anchor: from, head: from + selected.length + 4 },
          });
        }
      }
      view.focus();
      return true;
    }, []);

    const getImageMap = useCallback(() => imageMapRef?.current ?? {}, [imageMapRef]);

    const extensions = useMemo(
      () => [
        lineNumbers(),
        quizLanguage,
        imageInlinePlugin(getImageMap),
        boldPlugin(),
        htmlPasteExtension(),
        search({ top: true }),
        EditorState.phrases.of({
          'Find': 'Buscar',
          'Replace': 'Substituir',
          'next': 'próximo',
          'previous': 'anterior',
          'all': 'todos',
          'match case': 'diferenciar maiúsc.',
          'by word': 'palavra inteira',
          'regexp': 'expressão regular',
          'replace': 'substituir',
          'replace all': 'substituir todos',
          'close': 'fechar',
          'current match': 'resultado atual',
          'replaced $ matches': '$ substituições feitas',
          'replaced match on line $': 'substituído na linha $',
          'on line': 'na linha',
          'Go to line': 'Ir para linha',
          'go': 'ir',
        }),
        EditorState.allowMultipleSelections.of(true),
        EditorView.lineWrapping,
        keymap.of([
          ...defaultKeymap,
          indentWithTab,
          { key: 'Ctrl-q', run: insertTemplate },
          { key: 'Ctrl-b', run: wrapBold },
          { key: 'Ctrl-f', run: openSearch },
          { key: 'Ctrl-h', run: openSearch },
        ]),
        EditorView.theme({
          '&': { background: 'transparent' },

          // Gutter (line numbers)
          '.cm-gutters': { background: 'var(--paper-tint)', borderRight: '1px solid var(--orange-100)', color: 'var(--ink-400)' },
          '.cm-activeLineGutter': { background: 'var(--orange-50)' },
          '.cm-activeLine': { background: 'rgba(0,163,187,0.03)' },
          '.cm-selectionBackground': { background: 'rgba(0,163,187,0.12) !important' },
          '.cm-cursor': { borderLeftColor: 'var(--orange-500)' },

          // Search panel container
          '.cm-search': {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '8px 12px',
            background: 'var(--orange-50)',
            borderTop: '1px solid var(--orange-200)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            fontSize: '12px',
          },

          // Text inputs (Find / Replace)
          '.cm-search .cm-textfield': {
            border: '1px solid var(--orange-200)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            fontFamily: 'inherit',
            background: 'var(--paper)',
            color: 'var(--ink-900)',
            outline: 'none',
            width: '160px',
            transition: 'border 0.2s',
          },
          '.cm-search .cm-textfield:focus': {
            borderColor: 'var(--orange-400)',
            boxShadow: '0 0 0 2px rgba(0,163,187,0.12)',
          },

          // All buttons
          '.cm-search button': {
            background: 'var(--paper)',
            border: '1px solid var(--orange-200)',
            borderRadius: '6px',
            color: 'var(--orange-600)',
            fontSize: '11.5px',
            fontWeight: '600',
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          },
          '.cm-search button:hover': { background: 'var(--orange-100)' },

          // Close (×) button — make it subtle
          '.cm-search button[name=close]': {
            background: 'none',
            border: 'none',
            color: 'var(--ink-400)',
            fontSize: '1rem',
            padding: '2px 6px',
            marginLeft: 'auto',
          },
          '.cm-search button[name=close]:hover': { color: 'var(--orange-500)', background: 'none' },

          // Checkbox labels (match case / regexp / by word)
          '.cm-search label': {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            color: 'var(--ink-500)',
            cursor: 'pointer',
            userSelect: 'none',
          },
          '.cm-search input[type=checkbox]': {
            accentColor: 'var(--orange-500)',
            cursor: 'pointer',
          },
        }),
      ],
      [getImageMap, insertTemplate, wrapBold, openSearch],
    );

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onImageUpload?.(file);
      e.target.value = '';
    };

    return (
      <S.Wrapper $isDragOver={isDragOver} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        {/* Hidden image input — parent triggers via onImageUpload */}
        <input
          ref={imageInputRef}
          id="bar-image-upload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageFileChange}
        />

        <CodeMirror
          ref={cmRef}
          value={defaultValue}
          extensions={extensions}
          onChange={(_val: string, _update: ViewUpdate) => onChange?.(_val)}
          basicSetup={false}
          placeholder="Digite ou cole suas questões aqui... Você pode colar imagens diretamente no texto!"
        />
      </S.Wrapper>
    );
  },
);

quizEditorGlobal.displayName = 'quizEditorGlobal';
export default quizEditorGlobal;
