import { IQuestionCard, ICardOption } from './types';
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

export default function cardEditorGlobal({ cards, onChange }: ICardEditorProps) {
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
        return {
          ...c,
          options: c.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)),
        };
      }),
    );
  };

  const setCorrect = (cardId: string, optId: string) => {
    onChange(
      cards.map((c) => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          options: c.options.map((o) => ({ ...o, isCorrect: o.id === optId })),
        };
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
      {cards.map((card, cardIndex) => (
        <S.Card key={card.id}>
          <S.CardHeader>
            <S.CardLabel>Questão {cardIndex + 1}</S.CardLabel>
            <S.RemoveCardBtn onClick={() => removeCard(card.id)} title="Remover questão">
              ✕
            </S.RemoveCardBtn>
          </S.CardHeader>

          <S.TextArea
            placeholder="Enunciado da questão..."
            value={card.questionText}
            onChange={(e) => updateCard(card.id, { questionText: e.target.value })}
          />

          <S.OptionsSection>
            {card.options.map((opt, optIndex) => (
              <S.OptionRow key={opt.id}>
                <S.OptionLetter>{LETTERS[optIndex] ?? optIndex + 1})</S.OptionLetter>
                <S.CorrectRadio
                  type="radio"
                  name={`correct-${card.id}`}
                  checked={opt.isCorrect}
                  onChange={() => setCorrect(card.id, opt.id)}
                  title="Marcar como correta"
                />
                <S.OptionInput
                  placeholder={`Alternativa ${LETTERS[optIndex]?.toUpperCase() ?? optIndex + 1}...`}
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
                + Adicionar alternativa
              </S.AddOptionBtn>
            )}
          </S.OptionsSection>
        </S.Card>
      ))}

      <S.AddCardBtn onClick={() => onChange([...cards, makeCard()])}>
        + Adicionar questão
      </S.AddCardBtn>

      <S.ExportHint>
        Selecione o círculo verde ao lado de uma alternativa para marcá-la como correta
      </S.ExportHint>
    </S.Container>
  );
}
