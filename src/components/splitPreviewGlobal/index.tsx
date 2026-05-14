import { Question } from '../../pages/Home/xmlParser';
import * as S from './style';

interface ISplitPreviewProps {
  questions: Question[];
  editorSlot: React.ReactNode;
  imageMap?: Record<string, string>;
  imageVersion?: number;
}

function resolveImages(text: string, imageMap: Record<string, string>): string {
  return text.replace(/\[(imagem\d+)\]/gi, (match, id: string) => {
    const src = imageMap[id];
    return src
      ? `<img src="${src}" style="max-height:100px;max-width:220px;border-radius:6px;border:1px solid #ffe0b2;display:inline-block;vertical-align:middle;margin:2px 4px;" />`
      : match;
  });
}

// imageVersion is intentionally unused in the render body — its only purpose is to
// bust React's prop-equality check so the component re-renders when a new image is added.
export default function splitPreviewGlobal({ questions, editorSlot, imageMap = {} }: ISplitPreviewProps) {
  return (
    <S.SplitContainer>
      <S.EditorPane>{editorSlot}</S.EditorPane>

      <S.PreviewPane>
        <S.PreviewTitle>Preview em tempo real</S.PreviewTitle>

        {questions.length === 0 ? (
          <S.EmptyState>As questões aparecerão aqui conforme você digita</S.EmptyState>
        ) : (
          questions.map((q) => {
            const hasError = !q.correctAnswer || q.options.length === 0;
            return (
              <S.QuestionCard key={q.identifier} $hasError={hasError}>
                <S.QuestionHeader>
                  {q.identifier}
                  {!q.correctAnswer && q.options.length > 0 && (
                    <S.ErrorBadge>sem resposta correta</S.ErrorBadge>
                  )}
                  {q.options.length === 0 && (
                    <S.ErrorBadge>sem alternativas</S.ErrorBadge>
                  )}
                </S.QuestionHeader>

                <S.QuestionText
                  dangerouslySetInnerHTML={{ __html: resolveImages(q.questionText || '(sem enunciado)', imageMap) }}
                />

                {q.options.map((opt) => (
                  <S.OptionRow key={opt.letter} $correct={opt.letter === q.correctAnswer}>
                    {opt.letter.toUpperCase()}) {opt.text}
                  </S.OptionRow>
                ))}
              </S.QuestionCard>
            );
          })
        )}
      </S.PreviewPane>
    </S.SplitContainer>
  );
}
