import { useState, useRef, useEffect, useCallback } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Question, parseTextToQuestions, generateMoodleXML, normalizeExtractedText } from './xmlParser';
import * as S from './styles';
import InfoModal from '../../components/InfoModal';
import XmlOutputModal from '../../components/XmlOutputModal';
import QuizEditor, { QuizEditorHandle } from '../../components/quizEditorGlobal';
import StatsBar from '../../components/statsBarGlobal';
import SplitPreview from '../../components/splitPreviewGlobal';
import CardEditor, { makeCard, cardsToText } from '../../components/cardEditorGlobal';
import { IQuestionCard } from '../../components/cardEditorGlobal/types';
import { useQuizStats } from '../../hooks/useQuizStats';
import { extractTextFromDocx } from '../../utils/docxImport';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

type EditorMode = 'text' | 'split' | 'card';
const MODE_ORDER: EditorMode[] = ['text', 'split', 'card'];

export default function App() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showXml, setShowXml] = useState<boolean>(false);
  const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [questionStats, setQuestionStats] = useState<{ total: number; issues: string[] }>({ total: 0, issues: [] });
  const [editorMode, setEditorMode] = useState<EditorMode>('text');
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [editorContent, setEditorContent] = useState<string>('');
  const [cards, setCards] = useState<IQuestionCard[]>([makeCard()]);
  const [imageVersion, setImageVersion] = useState<number>(0);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [hasContent, setHasContent] = useState<boolean>(false);

  const editorRef = useRef<QuizEditorHandle>(null);
  const imageMapRef = useRef<Record<string, string>>({});
  const imageCounterRef = useRef<number>(1);

  const { stats, update: updateStats } = useQuizStats();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasContent) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasContent]);

  const handleEditorChange = useCallback((value: string) => {
    setEditorContent(value);
    updateStats(value);
    setPreviewQuestions(parseTextToQuestions(value));
    setHasContent(value.trim().length > 0);
  }, [updateStats]);

  const switchMode = useCallback((next: EditorMode) => {
    const current = editorRef.current?.getValue();
    if (current !== undefined) setEditorContent(current);
    const from = MODE_ORDER.indexOf(editorMode);
    const to = MODE_ORDER.indexOf(next);
    setSlideDir(to > from ? 'left' : 'right');
    setEditorMode(next);
  }, [editorMode]);

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

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
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
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [insertImage]);

  const toggleModal = (type: 'info' | 'xml', isOpen: boolean) => {
    if (type === 'info') setShowInfo(isOpen);
    if (type === 'xml') setShowXml(isOpen);
  };

  const getTextForGeneration = (): string => {
    if (editorMode === 'card') return cardsToText(cards);
    return editorRef.current?.getValue() ?? '';
  };

  const generateXML = useCallback(() => {
    const inputText = getTextForGeneration();
    const parsedQuestions: Question[] = parseTextToQuestions(inputText);
    const issues: string[] = [];
    parsedQuestions.forEach((q) => {
      if (!q.correctAnswer) issues.push(`A questão "${q.identifier}" está sem alternativa correta.`);
    });
    parsedQuestions.forEach((q) => {
      q.questionText = q.questionText.replace(/\[(imagem\d+)\]/gi, (match, imageId: string) => {
        const base64 = imageMapRef.current[imageId];
        return base64 ? `<img src="${base64}" /><br>` : match;
      });
    });
    const finalXml = generateMoodleXML(parsedQuestions, shuffleAnswers);
    setXmlContent(finalXml);
    setQuestionStats({ total: parsedQuestions.length, issues });
    toggleModal('xml', true);
  }, [editorMode, cards, shuffleAnswers]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyText = () => {
    navigator.clipboard.writeText(xmlContent)
      .then(() => alert('Texto copiado para a área de transferência!'))
      .catch((err) => console.error('Erro ao copiar:', err));
  };

  const downloadXML = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'questoes_moodle.xml';
    link.click();
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const lines: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      let currentLine = '';
      for (const item of textContent.items as { str?: string; hasEOL?: boolean }[]) {
        const text = item.str ?? '';
        currentLine += text;
        if (item.hasEOL) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = '';
        } else {
          currentLine += ' ';
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
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

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    event.target.value = '';
    setImportLoading(true);
    setImportError('');
    try {
      const parts: string[] = [];
      for (const file of files) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isDocx =
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.name.toLowerCase().endsWith('.docx');
        if (isPdf) {
          const raw = await extractTextFromPdf(file);
          const normalized = normalizeExtractedText(raw).trim();
          if (normalized) parts.push(normalized);
        } else if (isDocx) {
          const text = await extractTextFromDocx(file);
          if (text.trim()) parts.push(text.trim());
        } else {
          setImportError(`Arquivo "${file.name}" ignorado — envie apenas PDF ou .docx.`);
        }
      }
      if (parts.length > 0) appendTextToEditor(parts.join('\n\n'));
    } catch (err) {
      console.error(err);
      setImportError('Não foi possível extrair o texto. Verifique se o arquivo tem texto selecionável.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length === 0) return;
    setImportLoading(true);
    setImportError('');
    try {
      const parts: string[] = [];
      for (const file of files) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          const raw = await extractTextFromPdf(file);
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

  return (
    <>
      <S.Container>
        <S.Title>
          Gerador de Questões para Moodle (Formato XML)
          <S.Buttoninfo onClick={() => toggleModal('info', true)}>ⓘ</S.Buttoninfo>
        </S.Title>

        <S.ModeSwitcher>
          <S.ModeBtn $active={editorMode === 'text'} onClick={() => switchMode('text')}>
            Texto livre
          </S.ModeBtn>
          <S.ModeBtn $active={editorMode === 'split'} onClick={() => switchMode('split')}>
            Texto + Preview
          </S.ModeBtn>
          <S.ModeBtn $active={editorMode === 'card'} onClick={() => switchMode('card')}>
            Editor por cards
          </S.ModeBtn>
        </S.ModeSwitcher>

        <S.QuestionContainer>
          <S.ModePanel key={editorMode} $dir={slideDir}>
            {editorMode === 'text' && editorNode}

            {editorMode === 'split' && (
              <SplitPreview
                questions={previewQuestions}
                editorSlot={editorNode}
                imageMap={imageMapRef.current}
                imageVersion={imageVersion}
              />
            )}

            {editorMode === 'card' && (
              <CardEditor cards={cards} onChange={setCards} />
            )}
          </S.ModePanel>
        </S.QuestionContainer>

        {editorMode !== 'card' && <StatsBar stats={stats} />}

        <S.ActionsContainer>
          {importLoading && <S.StatusText style={{ color: '#b46000' }}>Processando arquivo...</S.StatusText>}
          {importError && <S.StatusText>{importError}</S.StatusText>}

          <S.CheckboxContainer>
            <input
              id="shuffle"
              type="checkbox"
              checked={shuffleAnswers}
              onChange={() => setShuffleAnswers(!shuffleAnswers)}
            />
            <label htmlFor="shuffle">Embaralhar Alternativas</label>
          </S.CheckboxContainer>

          <S.Button onClick={generateXML}>Gerar XML</S.Button>
        </S.ActionsContainer>
      </S.Container>

      <InfoModal visible={showInfo} onClose={() => toggleModal('info', false)} />

      <XmlOutputModal
        visible={showXml}
        onClose={() => toggleModal('xml', false)}
        stats={questionStats}
        xmlContent={xmlContent}
        onCopy={copyText}
        onDownload={downloadXML}
      />

      <S.Footer>
        <p>Desenvolvido por Daniel Holanda</p>
      </S.Footer>
    </>
  );
}
