import { useState, useRef, useEffect } from 'react';
import { Question, parseTextToQuestions, generateMoodleXML } from './xmlParser';
import * as S from './styles';
import InfoModal from '../../components/InfoModal';
import XmlOutputModal from '../../components/XmlOutputModal';

export default function App() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showXml, setShowXml] = useState<boolean>(false);
  const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(false);
  const questionsRef = useRef<HTMLTextAreaElement>(null);
  const [questionStats, setQuestionStats] = useState<{ total: number; issues: string[] }>({ total: 0, issues: [] });

  const imageMapRef = useRef<{ [key: string]: string }>({});
  const imageCounterRef = useRef<number>(1);

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const adjustTextareaHeight = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    const textarea = questionsRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const imageId = `imagem${imageCounterRef.current}`;
            imageMapRef.current[imageId] = base64;
            insertAtCursor(`[${imageId}]`);
            imageCounterRef.current += 1;

            const currentTextarea = questionsRef.current;
            if (currentTextarea) {
              currentTextarea.style.height = 'auto';
              currentTextarea.style.height = `${currentTextarea.scrollHeight}px`;
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    textarea.addEventListener('paste', handlePaste as EventListener);
    return () => textarea.removeEventListener('paste', handlePaste as EventListener);
  }, []);

  const toggleModal = (type: 'info' | 'xml', isOpen: boolean) => {
    if (type === 'info') setShowInfo(isOpen);
    if (type === 'xml') setShowXml(isOpen);
  };

  const generateXML = () => {
    const inputText = questionsRef.current?.value || '';
    const parsedQuestions: Question[] = parseTextToQuestions(inputText);

    const issues: string[] = [];
    parsedQuestions.forEach((q) => {
      if (!q.correctAnswer) {
        issues.push(`A questão "${q.identifier}" está sem alternativa correta.`);
      }
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
  };

  const copyText = () => {
    navigator.clipboard
      .writeText(xmlContent)
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const imageId = `imagem${imageCounterRef.current}`;
      imageMapRef.current[imageId] = base64;
      insertAtCursor(`[${imageId}]`);
      imageCounterRef.current += 1;

      const currentTextarea = questionsRef.current;
      if (currentTextarea) {
        currentTextarea.style.height = 'auto';
        currentTextarea.style.height = `${currentTextarea.scrollHeight}px`;
      }
    };
    reader.readAsDataURL(file);
  };

  const insertAtCursor = (text: string) => {
    const textarea = questionsRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    textarea.value = currentText.substring(0, start) + text + currentText.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const pos = textarea.selectionStart;
    const content = textarea.value;
    const regex = /\[imagem(\d+)\]/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const tag = match[0];
      const key = tag.replace(/\[|\]/g, '');
      const rangeStart = match.index;
      const rangeEnd = rangeStart + tag.length;
      if (pos >= rangeStart && pos <= rangeEnd) {
        if (imageMapRef.current[key]) {
          setHoveredImage(imageMapRef.current[key]);
          setPreviewPos({ top: e.clientY + 10, left: e.clientX + 10 });
          return;
        }
      }
    }
    setHoveredImage(null);
  };

  return (
    <>
      <S.Container>
        <S.Title>
          Gerador de Questões para Moodle (Formato XML)
          <S.Buttoninfo onClick={() => toggleModal('info', true)}>ⓘ</S.Buttoninfo>
        </S.Title>

        <S.QuestionContainer>
          <S.Textarea
            ref={questionsRef}
            placeholder="Digite ou cole suas questões aqui... Você pode colar imagens diretamente no texto!"
            onMouseMove={handleMouseMove}
            onInput={adjustTextareaHeight}
          />
        </S.QuestionContainer>

        {hoveredImage && (
          <S.ImagePreview style={{ top: previewPos.top, left: previewPos.left }}>
            <img src={hoveredImage} alt="Preview" style={{ maxWidth: 200, maxHeight: 200 }} />
          </S.ImagePreview>
        )}

        <S.ActionsContainer>
          <S.ImageUploadContainer>
            <label htmlFor="image-upload">Inserir Imagem</label>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
          </S.ImageUploadContainer>

          <S.CheckboxContainer>
            <input
              id="shuffle"
              type="checkbox"
              checked={shuffleAnswers}
              onChange={() => setShuffleAnswers(!shuffleAnswers)}
            />
            <label htmlFor="shuffle">Embaralhar Alternativas?</label>
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
