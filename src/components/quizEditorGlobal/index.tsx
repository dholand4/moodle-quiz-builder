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

const QUESTION_TEMPLATE = `1. Enunciado da questão
a) Alternativa A
b) Alternativa B
c) Alternativa C
d) Alternativa D {correto}
`;

export interface QuizEditorHandle {
  getValue: () => string;
  setValue: (text: string) => void;
  insertAtCursor: (text: string) => void;
  focus: () => void;
  refreshDecorations: () => void;
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
      onFileImport,
    },
    ref,
  ) => {
    const cmRef = useRef<ReactCodeMirrorRef>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileImportRef = useRef<HTMLInputElement>(null);

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
    }));

    const insertTemplate = useCallback(() => {
      const view = getView();
      if (!view) return true;
      const { from, to } = view.state.selection.main;
      const doc = view.state.doc.toString();
      const prefix = from > 0 && doc[from - 1] !== '\n' ? '\n\n' : '';
      const insert = prefix + QUESTION_TEMPLATE;
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
      if (from === to) {
        const placeholder = '*negrito*';
        view.dispatch({
          changes: { from, insert: placeholder },
          selection: { anchor: from + 1, head: from + placeholder.length - 1 },
        });
      } else {
        const selected = view.state.doc.sliceString(from, to);
        view.dispatch({
          changes: { from, to, insert: `*${selected}*` },
          selection: { anchor: from, head: from + selected.length + 2 },
        });
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
          '.cm-gutters': { background: '#fff8f0', borderRight: '1px solid #ffe0b2', color: '#c08040' },
          '.cm-activeLineGutter': { background: '#fff3e0' },
          '.cm-activeLine': { background: '#fff9f0' },
          '.cm-selectionBackground': { background: '#ffe0b240 !important' },
          '.cm-cursor': { borderLeftColor: '#e65100' },

          // Search panel container
          '.cm-search': {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '8px 12px',
            background: '#fff8f0',
            borderTop: '2px solid #ffb74a',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: '0.85rem',
          },

          // Text inputs (Find / Replace)
          '.cm-search .cm-textfield': {
            border: '1px solid #ffcc80',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            background: '#fff',
            color: '#333',
            outline: 'none',
            width: '160px',
            transition: 'border 0.2s',
          },
          '.cm-search .cm-textfield:focus': {
            borderColor: '#fb8c00',
            boxShadow: '0 0 0 2px rgba(251,140,0,0.15)',
          },

          // All buttons
          '.cm-search button': {
            background: '#fff3e0',
            border: '1px solid #ffcc80',
            borderRadius: '6px',
            color: '#e65100',
            fontSize: '0.8rem',
            fontWeight: '600',
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          },
          '.cm-search button:hover': { background: '#ffe0b2' },

          // Close (×) button — make it subtle
          '.cm-search button[name=close]': {
            background: 'none',
            border: 'none',
            color: '#bbb',
            fontSize: '1rem',
            padding: '2px 6px',
            marginLeft: 'auto',
          },
          '.cm-search button[name=close]:hover': { color: '#e65100', background: 'none' },

          // Checkbox labels (match case / regexp / by word)
          '.cm-search label': {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            color: '#b46000',
            cursor: 'pointer',
            userSelect: 'none',
          },
          '.cm-search input[type=checkbox]': {
            accentColor: '#e65100',
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
        <S.ShortcutBar>
          {/* Clickable shortcuts */}
          <S.BarButton onClick={insertTemplate} title="Inserir modelo de questão (Ctrl+Q)">
            <kbd>Ctrl+Q</kbd> novo modelo
          </S.BarButton>

          <S.BarSeparator>·</S.BarSeparator>

          <S.BarButton onClick={openSearch} title="Buscar (Ctrl+F)">
            <kbd>Ctrl+F</kbd> buscar
          </S.BarButton>

          <S.BarSeparator>·</S.BarSeparator>

          <S.BarButton onClick={openSearch} title="Buscar e substituir (Ctrl+H)">
            <kbd>Ctrl+H</kbd> substituir
          </S.BarButton>

          <S.BarSeparator>·</S.BarSeparator>

          <S.BarBoldButton onClick={wrapBold} title="Negrito (Ctrl+B)">
            <b>N</b>
          </S.BarBoldButton>

          <S.BarSeparator>·</S.BarSeparator>

          {/* Importar PDF / .docx */}
          {onFileImport && (
            <>
              <S.BarFileLabel htmlFor="bar-file-import" title="Importar PDF ou Word">
                📄 Importar PDF / .docx
              </S.BarFileLabel>
              <input
                ref={fileImportRef}
                id="bar-file-import"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                style={{ display: 'none' }}
                onChange={onFileImport}
              />
            </>
          )}

          {/* Inserir imagem */}
          {onImageUpload && (
            <>
              <S.BarFileLabel htmlFor="bar-image-upload" title="Inserir imagem no cursor">
                📎 Inserir imagem
              </S.BarFileLabel>
              <input
                ref={imageInputRef}
                id="bar-image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageFileChange}
              />
            </>
          )}
        </S.ShortcutBar>

        <CodeMirror
          ref={cmRef}
          value={defaultValue}
          extensions={extensions}
          onChange={(_val: string, update: ViewUpdate) => onChange?.(_val, update)}
          basicSetup={false}
          placeholder="Digite ou cole suas questões aqui... Você pode colar imagens diretamente no texto!"
        />
      </S.Wrapper>
    );
  },
);

quizEditorGlobal.displayName = 'quizEditorGlobal';
export default quizEditorGlobal;
