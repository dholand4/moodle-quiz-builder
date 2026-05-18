import { IQuestionCard, ICardOption } from './types';
import { Question } from '../../pages/Home/xmlParser';
import * as S from './style';

const LETTERS = 'abcdefgh';

function makeOption(overrides: Partial<ICardOption> = {}): ICardOption {
  return { id: crypto.randomUUID(), text: '', isCorrect: false, ...overrides };
}

export function makeCard(): IQuestionCard {
  return {
    id: crypto.randomUUID(),
    questionText: '',
    options: [makeOption(), makeOption(), makeOption(), makeOption()],
  };
}

export function textToCards(questions: Question[]): IQuestionCard[] {
  if (questions.length === 0) return [makeCard()];
  return questions.map((q) => ({
    id: crypto.randomUUID(),
    questionText: q.questionText.replace(/<[^>]+>/g, '').trim(),
    options: q.options.length > 0
      ? q.options.map((opt) => ({
          id: crypto.randomUUID(),
          text: opt.text,
          isCorrect: opt.letter === q.correctAnswer,
        }))
      : [makeOption(), makeOption(), makeOption(), makeOption()],
  }));
}

export function cardsToText(cards: IQuestionCard[]): string {
  return cards
    .map((card, i) => {
      const header = `${i + 1}. ${card.questionText}`;
      const opts = card.options
        .filter((o) => o.text.trim())
        .map((opt, idx) => {
          const letter = LETTERS[idx] ?? String(idx + 1);
          const correct = opt.isCorrect ? ' {correto}' : '';
          return `${letter}) ${opt.text}${correct}`;
        });
      return [header, ...opts].join('\n');
    })
    .join('\n\n');
}

interface ICardEditorProps {
  cards: IQuestionCard[];
  onChange: (cards: IQuestionCard[]) => void;
}

export default function CardEditor({ cards, onChange }: ICardEditorProps) {
  const updateCard = (id: string, patch: Partial<IQuestionCard>) => {
    onChange(cards.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCard = (id: string) => {
    onChange(cards.filter((c) => c.id !== id));
  };

  const updateOption = (cardId: string, optId: string, patch: Partial<ICardOption>) => {
    onChange(
      cards.map((c) => {
        if (c.id !== cardId) return c;
        return { ...c, options: c.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)) };
      }),
    );
  };

  const setCorrect = (cardId: string, optId: string) => {
    onChange(
      cards.map((c) => {
        if (c.id !== cardId) return c;
        return { ...c, options: c.options.map((o) => ({ ...o, isCorrect: o.id === optId })) };
      }),
    );
  };

  const addOption = (cardId: string) => {
    onChange(
      cards.map((c) => {
        if (c.id !== cardId) return c;
        if (c.options.length >= 8) return c;
        return { ...c, options: [...c.options, makeOption()] };
      }),
    );
  };

  const removeOption = (cardId: string, optId: string) => {
    onChange(
      cards.map((c) => {
        if (c.id !== cardId) return c;
        if (c.options.length <= 2) return c;
        return { ...c, options: c.options.filter((o) => o.id !== optId) };
      }),
    );
  };

  return (
    <S.Container>
      <S.Grid>
        {cards.map((card, cardIndex) => {
          const hasCorrect = card.options.some((o) => o.isCorrect);
          const hasContent = card.options.some((o) => o.text.trim());
          const hasError = hasContent && !hasCorrect;

          return (
            <S.Card key={card.id} $hasError={hasError}>
              <S.CardHeader $hasError={hasError}>
                <S.CardLabel $hasError={hasError}>Q{String(cardIndex + 1).padStart(2, '0')}</S.CardLabel>
                {hasError && <S.ErrorBadge>⚠ sem gabarito</S.ErrorBadge>}
                <S.RemoveCardBtn onClick={() => removeCard(card.id)} title="Remover questão">
                  ✕
                </S.RemoveCardBtn>
              </S.CardHeader>

              <S.TextArea
                placeholder="Enunciado da questão..."
                value={card.questionText}
                rows={2}
                onChange={(e) => updateCard(card.id, { questionText: e.target.value })}
              />

              <S.OptionsSection>
                {card.options.map((opt, optIndex) => (
                  <S.OptionRow key={opt.id} $correct={opt.isCorrect}>
                    <S.CorrectRadio
                      type="radio"
                      name={`correct-${card.id}`}
                      checked={opt.isCorrect}
                      onChange={() => setCorrect(card.id, opt.id)}
                      title="Marcar como correta"
                    />
                    <S.OptionLetter>{LETTERS[optIndex] ?? optIndex + 1})</S.OptionLetter>
                    <S.OptionInput
                      placeholder={`Alternativa ${(LETTERS[optIndex] ?? '').toUpperCase() || optIndex + 1}…`}
                      value={opt.text}
                      onChange={(e) => updateOption(card.id, opt.id, { text: e.target.value })}
                    />
                    <S.RemoveOptBtn
                      onClick={() => removeOption(card.id, opt.id)}
                      title="Remover alternativa"
                    >
                      ✕
                    </S.RemoveOptBtn>
                  </S.OptionRow>
                ))}

                {card.options.length < 8 && (
                  <S.AddOptionBtn onClick={() => addOption(card.id)}>
                    + alternativa
                  </S.AddOptionBtn>
                )}
              </S.OptionsSection>
            </S.Card>
          );
        })}

        <S.AddCardBtn onClick={() => onChange([...cards, makeCard()])}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Adicionar questão
        </S.AddCardBtn>

        <S.ExportHint>
          Selecione o círculo ao lado de uma alternativa para marcá-la como correta
        </S.ExportHint>
      </S.Grid>
    </S.Container>
  );
}
