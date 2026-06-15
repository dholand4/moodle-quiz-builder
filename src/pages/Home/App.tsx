import { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Question, parseTextToQuestions, generateMoodleXML, normalizeExtractedText } from './xmlParser';
import InfoModal from '../../components/InfoModal';
import QuizEditor, { QuizEditorHandle } from '../../components/quizEditorGlobal';
import CardEditor, { makeCard, cardsToText, textToCards } from '../../components/cardEditorGlobal';
import { IQuestionCard } from '../../components/cardEditorGlobal/types';
import { useQuizStats } from '../../hooks/useQuizStats';
import { extractTextFromDocx } from '../../utils/docxImport';
import TopBar from '../../components/topBarGlobal';
import Sidebar from '../../components/sidebarGlobal';
import RightPane, { RecentImport } from '../../components/rightPaneGlobal';
import BottomBar from '../../components/bottomBarGlobal';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

type EditorMode = 'text' | 'card';
const MODE_ORDER: EditorMode[] = ['text', 'card'];

/* ── Layout shell ─────────────────────────────────────── */
const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
`;

const Middle = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const slideRight = keyframes`
  from { opacity: 0; transform: translateX(24px) scale(0.99); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`;

const slideLeft = keyframes`
  from { opacity: 0; transform: translateX(-24px) scale(0.99); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-2);
`;

const ModePanel = styled.div<{ $dir: 'left' | 'right' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${({ $dir }) => ($dir === 'right' ? slideLeft : slideRight)} 0.2s ease;
`;

/* ── Issues modal ─────────────────────────────────────── */
const modalFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const modalSlideIn = keyframes`
  from { opacity: 0; transform: translateY(-16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const IssuesBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(31, 20, 12, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${modalFadeIn} 0.15s ease;
`;

const IssuesBox = styled.div`
  background: var(--paper);
  border-radius: 14px;
  padding: 28px 28px 24px;
  width: 420px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 8px 32px rgba(0,30,40,0.16);
  animation: ${modalSlideIn} 0.18s ease;

  h3 {
    margin: 0 0 6px;
    font-size: 15.5px;
    font-weight: 700;
    color: var(--ink-900);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 0 0 14px;
    font-size: 13px;
    color: var(--ink-500);
    line-height: 1.5;
  }

  ul {
    margin: 0 0 22px;
    padding: 12px 14px 12px 32px;
    background: #fff5f3;
    border: 1px solid #fcd1c8;
    border-radius: 8px;
    font-size: 12.5px;
    color: var(--danger);
    line-height: 1.7;
  }

  li { margin: 0; }
`;

const IssuesCloseBtn = styled.button`
  display: block;
  width: 100%;
  height: 38px;
  border: none;
  border-radius: 8px;
  background: var(--orange-500);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: var(--orange-600); }
`;

/* ── Editor toolbar (text mode) ───────────────────────── */
const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 38px;
  flex-shrink: 0;
  background: var(--paper);
  border-bottom: 1px solid var(--orange-100);
`;

const ToolbarLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-500);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const ToolbarSep = styled.span`
  color: var(--orange-200);
  user-select: none;
  font-size: 13px;
`;

const ToolbarGhost = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 9px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--orange-200);
  color: var(--ink-700);
  font-family: inherit;
  font-weight: 600;
  font-size: 11.5px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--orange-50); }
`;


const AlignGroup = styled.div`
  display: inline-flex;
  border: 1px solid var(--orange-200);
  border-radius: 6px;
  overflow: hidden;
`;

const AlignBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--orange-200);
  color: var(--ink-700);
  cursor: pointer;
  transition: background 0.15s;
  &:last-child { border-right: none; }
  &:hover { background: var(--orange-50); color: var(--orange-500); }
`;

/* ── Card mode header ─────────────────────────────────── */
const CardToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  height: 38px;
  flex-shrink: 0;
  background: var(--paper);
  border-bottom: 1px solid var(--orange-100);
  font-size: 12.5px;
`;

export default function App() {
  const [showInfo, setShowInfo]         = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [issuesModal, setIssuesModal]   = useState<string[] | null>(null);
  const [importLoading, setImportLoading]  = useState(false);
  const [importError, setImportError]      = useState('');
  const [isDragOver, setIsDragOver]        = useState(false);
  const [filename, setFilename]        = useState('Quiz sem título');
  const [editorMode, setEditorMode]   = useState<EditorMode>('text');
  const [slideDir, setSlideDir]       = useState<'left' | 'right'>('left');
  const [editorContent, setEditorContent] = useState('');
  const [cards, setCards]               = useState<IQuestionCard[]>([makeCard()]);
  const [imageVersion, setImageVersion] = useState(0);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [hasContent, setHasContent]     = useState(false);
  const [recentImports, setRecentImports] = useState<RecentImport[]>([]);

  const editorRef         = useRef<QuizEditorHandle>(null);
  const fileImportRef     = useRef<HTMLInputElement>(null);
  const imageMapRef       = useRef<Record<string, string>>({});
  const imageCounterRef   = useRef(1);

  const { stats, update: updateStats } = useQuizStats();

  /* beforeunload guard */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasContent) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasContent]);

  /* editor change */
  const handleEditorChange = useCallback((value: string) => {
    const normalized = value.includes('|') ? value.replace(/\s*\|\s*/g, '\n\n') : value;
    if (normalized !== value) editorRef.current?.setValue(normalized);
    setEditorContent(normalized);
    updateStats(normalized);
    setPreviewQuestions(parseTextToQuestions(normalized));
    setHasContent(normalized.trim().length > 0);
  }, [updateStats]);

  /* mode switch */
  const switchMode = useCallback((next: EditorMode) => {
    const current = editorRef.current?.getValue();
    if (current !== undefined) setEditorContent(current);

    if (next === 'card' && editorMode === 'text') {
      const text = editorRef.current?.getValue() ?? editorContent;
      const questions = parseTextToQuestions(text);
      if (questions.length > 0) setCards(textToCards(questions));
    }

    const from = MODE_ORDER.indexOf(editorMode);
    const to   = MODE_ORDER.indexOf(next);
    setSlideDir(to > from ? 'left' : 'right');
    setEditorMode(next);
  }, [editorMode, editorContent]);

  /* image insert */
  const insertImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const imageId = `imagem${imageCounterRef.current}`;
      imageMapRef.current[imageId] = base64;
      imageCounterRef.current += 1;
      editorRef.current?.insertAtCursor(`[${imageId}]`);
      editorRef.current?.refreshDecorations();
      setImageVersion((v) => v + 1);
    };
    reader.readAsDataURL(file);
  }, []);

  /* paste image */
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) insertImage(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [insertImage]);

  /* text for generation */
  const getTextForGeneration = (): string => {
    if (editorMode === 'card') return cardsToText(cards);
    return editorRef.current?.getValue() ?? '';
  };

  /* generate XML */
  const generateAndDownloadXML = useCallback(() => {
    const inputText = getTextForGeneration();
    const parsedQuestions = parseTextToQuestions(inputText);
    const issues: string[] = [];
    parsedQuestions.forEach((q) => {
      if (!q.correctAnswer) issues.push(`Questão "${q.identifier}" está sem alternativa correta`);
    });
    if (issues.length > 0) { setIssuesModal(issues); return; }

    parsedQuestions.forEach((q) => {
      q.questionText = q.questionText.replace(/\[(imagem\d+)\]/gi, (_match, imageId: string) => {
        const base64 = imageMapRef.current[imageId];
        return base64 ? `<img src="${base64}" /><br>` : _match;
      });
    });
    const finalXml = generateMoodleXML(parsedQuestions, shuffleAnswers);
    const blob = new Blob([finalXml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename.trim() || 'questoes_moodle'}.xml`;
    link.click();
  }, [editorMode, cards, shuffleAnswers, filename]); // eslint-disable-line react-hooks/exhaustive-deps

  /* generate PDF */
  const generateAndDownloadPDF = useCallback(() => {
    const questions = parseTextToQuestions(getTextForGeneration());
    const issues: string[] = [];
    questions.forEach((q) => {
      if (!q.correctAnswer) issues.push(`Questão "${q.identifier}" está sem alternativa correta`);
    });
    if (issues.length > 0) { setIssuesModal(issues); return; }

    const items = questions.map((q, i) => {
      const opts = q.options
        .map((o) => `<li style="margin:3px 0">${o.text}${o.letter === q.correctAnswer ? ' <strong>(✓)</strong>' : ''}</li>`)
        .join('');
      return `<div style="margin-bottom:20px"><p><strong>${i + 1}. ${q.questionText.replace(/<[^>]+>/g, '')}</strong></p><ol type="a">${opts}</ol></div>`;
    }).join('');

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title>
      <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;font-size:14px}h1{font-size:18px;margin-bottom:24px}</style>
      </head><body><h1>${filename}</h1>${items}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }, [editorMode, cards, filename]); // eslint-disable-line react-hooks/exhaustive-deps

  /* PDF extraction */
  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const lines: string[] = [];
    const optionRegex = /^([a-hA-H])[.)]\s+/;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      type PdfItem = { str?: string; hasEOL?: boolean; fontName?: string };
      const items = textContent.items as PdfItem[];

      let currentLine = '';
      let lineAllBold = true;
      let lineHasText = false;

      const flushLine = () => {
        const trimmed = currentLine.trim();
        if (!trimmed) return;
        if (lineHasText && lineAllBold && optionRegex.test(trimmed)) {
          lines.push(trimmed + ' {correta}');
        } else {
          lines.push(trimmed);
        }
      };

      for (const item of items) {
        const text = item.str ?? '';
        const isBold = /bold/i.test(item.fontName ?? '');
        if (text.trim()) {
          if (!lineHasText) { lineAllBold = isBold; lineHasText = true; }
          else if (!isBold) lineAllBold = false;
        }
        currentLine += text;
        if (item.hasEOL) {
          flushLine();
          currentLine = '';
          lineAllBold = true;
          lineHasText = false;
        } else {
          currentLine += ' ';
        }
      }
      flushLine();
      if (pageNumber < pdf.numPages) lines.push('');
    }
    return lines.join('\n').trim();
  };

  const appendTextToEditor = (incoming: string) => {
    const current = editorRef.current?.getValue().trim() ?? '';
    const next = current ? `${current}\n\n${incoming}` : incoming;
    editorRef.current?.setValue(next);
    updateStats(next);
    setPreviewQuestions(parseTextToQuestions(next));
    setHasContent(next.trim().length > 0);
  };

  /* file import */
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    event.target.value = '';
    setImportLoading(true);
    setImportError('');

    const newImports: RecentImport[] = files.map((f) => ({
      name: f.name,
      count: 0,
      status: 'parsing' as const,
      time: new Date(),
    }));
    setRecentImports((prev) => [...newImports, ...prev].slice(0, 10));

    try {
      const parts: string[] = [];
      for (const file of files) {
        const isPdf  = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');
        if (isPdf) {
          const raw        = await extractTextFromPdf(file);
          const normalized = normalizeExtractedText(raw).trim();
          if (normalized) parts.push(normalized);
          updateImportStatus(file.name, 'done', parseTextToQuestions(normalized).length);
        } else if (isDocx) {
          const text = await extractTextFromDocx(file);
          if (text.trim()) parts.push(text.trim());
          updateImportStatus(file.name, 'done', parseTextToQuestions(text).length);
        } else {
          setImportError(`Arquivo "${file.name}" ignorado — envie apenas PDF ou .docx.`);
          updateImportStatus(file.name, 'error', 0);
        }
      }
      if (parts.length > 0) {
        appendTextToEditor(parts.join('\n\n'));
        if (editorMode !== 'text') switchMode('text');
      }
    } catch (err) {
      console.error(err);
      setImportError('Não foi possível extrair o texto. Verifique se o arquivo tem texto selecionável.');
      files.forEach((f) => updateImportStatus(f.name, 'error', 0));
    } finally {
      setImportLoading(false);
    }
  };

  const updateImportStatus = (name: string, status: 'done' | 'error', count: number) => {
    setRecentImports((prev) =>
      prev.map((imp) => (imp.name === name && imp.status === 'parsing') ? { ...imp, status, count } : imp),
    );
  };

  /* drag & drop */
  const handleDragOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop      = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    setImportLoading(true);
    setImportError('');
    try {
      const parts: string[] = [];
      for (const file of files) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          const raw        = await extractTextFromPdf(file);
          const normalized = normalizeExtractedText(raw).trim();
          if (normalized) parts.push(normalized);
        }
      }
      if (parts.length > 0) appendTextToEditor(parts.join('\n\n'));
    } catch (err) {
      console.error(err);
      setImportError('Não foi possível extrair o texto do PDF.');
    } finally {
      setImportLoading(false);
    }
  };

  /* sidebar questions: derive from cards when in card mode */
  const cardQuestions: Question[] = editorMode === 'card'
    ? parseTextToQuestions(cardsToText(cards))
    : [];

  const sidebarQuestions = editorMode === 'card' ? cardQuestions : previewQuestions;

  /* editor node */
  const editorNode = (
    <QuizEditor
      ref={editorRef}
      defaultValue={editorContent}
      isDragOver={isDragOver}
      imageMapRef={imageMapRef}
      onChange={handleEditorChange}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onImageUpload={insertImage}
      onFileImport={handleFileImport}
    />
  );

  /* card change → sync back to text */
  const handleCardsChange = useCallback((newCards: IQuestionCard[]) => {
    setCards(newCards);
    const text = cardsToText(newCards);
    setEditorContent(text);
    updateStats(text);
    setPreviewQuestions(parseTextToQuestions(text));
    setHasContent(newCards.some((c) => c.questionText.trim() || c.options.some((o) => o.text.trim())));
  }, [updateStats]);

  /* add new card + switch to card mode */
  const handleAddQuestion = () => {
    const newCards = [...cards, makeCard()];
    if (editorMode === 'card') {
      handleCardsChange(newCards);
    } else {
      setCards(newCards);
      switchMode('card');
    }
  };

  return (
    <Shell>
      {/* hidden file import input — triggered by TopBar */}
      <input
        ref={fileImportRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />

      <TopBar
        activeMode={editorMode}
        onModeChange={switchMode}
        onImport={() => fileImportRef.current?.click()}
        onGenerateXML={generateAndDownloadXML}
        onGeneratePDF={generateAndDownloadPDF}
        onInfo={() => setShowInfo(true)}
        shuffleAnswers={shuffleAnswers}
        onToggleShuffle={() => setShuffleAnswers((s) => !s)}
        filename={filename}
        onFilenameChange={setFilename}
      />

      <Middle>
        <Sidebar
          questions={sidebarQuestions}
          mode={editorMode}
          onAddQuestion={handleAddQuestion}
          onQuestionClick={(id) => editorMode === 'text' && editorRef.current?.scrollToQuestion(id)}
        />

        <MainArea>
          <ModePanel key={editorMode} $dir={slideDir}>
            {/* ── Text mode ── */}
            {editorMode === 'text' && (
              <>
                <EditorToolbar>
                  <ToolbarLabel>Editor de texto</ToolbarLabel>
                  <ToolbarSep>·</ToolbarSep>
                  <ToolbarGhost onClick={() => editorRef.current?.insertTemplate()} title="Inserir modelo (Ctrl+Q)">
                    <span className="kbd" style={{ fontSize: 10, padding: '1px 4px' }}>Ctrl+Q</span>
                    novo modelo
                  </ToolbarGhost>
                  <ToolbarGhost onClick={() => editorRef.current?.openSearch()} title="Buscar (Ctrl+F)">
                    <span className="kbd" style={{ fontSize: 10, padding: '1px 4px' }}>Ctrl+F</span>
                    buscar
                  </ToolbarGhost>
                  <ToolbarGhost onClick={() => editorRef.current?.wrapBold()} title="Negrito (Ctrl+B)" style={{ fontWeight: 700 }}>
                    <b>N</b>
                  </ToolbarGhost>
                  <AlignGroup>
                    <AlignBtn onClick={() => editorRef.current?.setAlignment('none')} title="Alinhar à esquerda">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 2h11M1 5h7M1 8h11M1 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </AlignBtn>
                    <AlignBtn onClick={() => editorRef.current?.setAlignment('center')} title="Centralizar (Ctrl+E)">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 2h11M3 5h7M1 8h11M3 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </AlignBtn>
                    <AlignBtn onClick={() => editorRef.current?.setAlignment('justify')} title="Justificar">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 2h11M1 5h11M1 8h11M1 11h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </AlignBtn>
                  </AlignGroup>
                  <ToolbarGhost onClick={() => editorRef.current?.triggerImageUpload()} title="Inserir imagem">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="0.5" y="0.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="4" cy="4" r="1.2" fill="currentColor"/>
                      <path d="M0.5 8.5l3-3 2 2 1.5-2 3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    imagem
                  </ToolbarGhost>
                </EditorToolbar>
                {editorNode}
              </>
            )}

            {/* ── Card mode ── */}
            {editorMode === 'card' && (
              <>
                <CardToolbar>
                  <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                    {cards.length} {cards.length === 1 ? 'questão' : 'questões'}
                  </span>
                  {cardQuestions.length > 0 && (
                    <>
                      <span style={{ color: 'var(--ink-400)' }}>·</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 11.5 }}>
                        {cardQuestions.filter(q => q.correctAnswer).length} ok
                      </span>
                      {cardQuestions.filter(q => !q.correctAnswer).length > 0 && (
                        <>
                          <span style={{ color: 'var(--ink-400)' }}> </span>
                          <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 11.5 }}>
                            {cardQuestions.filter(q => !q.correctAnswer).length} sem gabarito
                          </span>
                        </>
                      )}
                    </>
                  )}
                </CardToolbar>
                <CardEditor cards={cards} onChange={handleCardsChange} />
              </>
            )}
          </ModePanel>
        </MainArea>

        <RightPane
          questions={previewQuestions}
          imageMap={imageMapRef.current}
          imageVersion={imageVersion}
          recentImports={recentImports}
          activeMode={editorMode}
        />
      </Middle>

      <BottomBar
        stats={stats}
        importLoading={importLoading}
        importError={importError}
      />

      <InfoModal visible={showInfo} onClose={() => setShowInfo(false)} />

      {issuesModal && (
        <IssuesBackdrop onClick={() => setIssuesModal(null)}>
          <IssuesBox onClick={(e) => e.stopPropagation()}>
            <h3>⚠ Problemas encontrados</h3>
            <p>Corrija os problemas abaixo antes de baixar:</p>
            <ul>
              {issuesModal.slice(0, 8).map((issue, i) => <li key={i}>{issue}</li>)}
              {issuesModal.length > 8 && <li>…e mais {issuesModal.length - 8} problemas</li>}
            </ul>
            <IssuesCloseBtn onClick={() => setIssuesModal(null)}>Entendido, vou corrigir</IssuesCloseBtn>
          </IssuesBox>
        </IssuesBackdrop>
      )}
    </Shell>
  );
}
