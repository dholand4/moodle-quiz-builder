import { useState } from 'react';
import styled from 'styled-components';
import { Question } from '../../pages/Home/xmlParser';

type EditorMode = 'text' | 'card';

interface SidebarProps {
  questions: Question[];
  mode: EditorMode;
  onAddQuestion?: () => void;
  onQuestionClick?: (identifier: string) => void;
}

const Wrap = styled.aside`
  width: 236px;
  flex-shrink: 0;
  background: var(--bg-2);
  border-right: 1px solid var(--orange-100);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Head = styled.div`
  padding: 10px 10px 8px;
  flex-shrink: 0;
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 30px;
  padding: 0 10px 0 28px;
  border-radius: 7px;
  border: 1px solid var(--orange-100);
  background: var(--paper);
  font-family: inherit;
  font-size: 12px;
  color: var(--ink-900);
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--orange-300);
  }

  &::placeholder {
    color: var(--ink-400);
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  background: ${({ $active }) => ($active ? 'var(--orange-500)' : 'var(--paper)')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--ink-700)')};
  border: ${({ $active }) => ($active ? 'none' : '1px solid var(--orange-100)')};
  font-family: inherit;
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;

  &::-webkit-scrollbar { width: 0; }
`;

const QItem = styled.div<{ $active?: boolean; $state: 'ok' | 'error' | 'warn' | 'image' }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 7px;
  background: ${({ $active }) => ($active ? 'var(--orange-50)' : 'transparent')};
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--orange-50)' : 'rgba(0,163,187,0.06)')};
  }
`;

const QNum = styled.span<{ $active?: boolean }>`
  font-size: 10px;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: ${({ $active }) => ($active ? 'var(--orange-600)' : 'var(--ink-500)')};
  min-width: 22px;
  flex-shrink: 0;
`;

const QText = styled.span<{ $active?: boolean }>`
  flex: 1;
  font-size: 11.5px;
  line-height: 1.35;
  color: ${({ $active }) => ($active ? 'var(--ink-900)' : 'var(--ink-700)')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusDot = styled.span<{ $color: string }>`
  font-size: 10px;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const AddBtn = styled.button`
  margin: 0 10px 10px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1.5px dashed var(--orange-300);
  color: var(--orange-600);
  font-family: inherit;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover {
    background: var(--orange-50);
  }
`;

const EmptyState = styled.div`
  padding: 24px 12px;
  text-align: center;
  color: var(--ink-400);
  font-size: 11.5px;
  line-height: 1.5;
`;

type Filter = 'all' | 'error' | 'image';

function getState(q: Question): 'ok' | 'error' | 'warn' | 'image' {
  if (!q.correctAnswer) return 'error';
  if (q.options.length === 0) return 'warn';
  if (/\[imagem\d+\]/i.test(q.questionText)) return 'image';
  return 'ok';
}

const DOT: Record<string, { color: string; icon: string }> = {
  ok:    { color: 'var(--success)',    icon: '●' },
  error: { color: 'var(--danger)',     icon: '⚠' },
  warn:  { color: 'var(--warning)',    icon: '○' },
  image: { color: 'var(--syn-image)',  icon: '◈' },
};

export default function Sidebar({ questions, mode, onAddQuestion, onQuestionClick }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState(0);

  const errorCount = questions.filter((q) => !q.correctAnswer).length;
  const imageCount = questions.filter((q) => /\[imagem\d+\]/i.test(q.questionText)).length;

  const visible = questions.filter((q) => {
    const state = getState(q);
    if (filter === 'error' && state !== 'error') return false;
    if (filter === 'image' && state !== 'image') return false;
    const term = search.trim().toLowerCase();
    if (term && !q.questionText.toLowerCase().includes(term) && !q.identifier.toLowerCase().includes(term)) return false;
    return true;
  });

  return (
    <Wrap>
      <Head>
        <SearchBox>
          <SearchIcon>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M7.5 7.5L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </SearchIcon>
          <SearchInput
            placeholder="Buscar questão"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBox>
        <FilterRow>
          <FilterChip $active={filter === 'all'} onClick={() => setFilter('all')}>
            Todas <span style={{ opacity: 0.75 }}>{questions.length}</span>
          </FilterChip>
          {errorCount > 0 && (
            <FilterChip $active={filter === 'error'} onClick={() => setFilter('error')}>
              Erro <span style={{ opacity: 0.75 }}>{errorCount}</span>
            </FilterChip>
          )}
          {imageCount > 0 && (
            <FilterChip $active={filter === 'image'} onClick={() => setFilter('image')}>
              Imagens <span style={{ opacity: 0.75 }}>{imageCount}</span>
            </FilterChip>
          )}
        </FilterRow>
      </Head>

      <List>
        {visible.length === 0 && questions.length === 0 && (
          <EmptyState>
            {mode === 'card'
              ? 'Adicione questões usando os cards abaixo'
              : 'As questões detectadas aparecerão aqui'}
          </EmptyState>
        )}
        {visible.length === 0 && questions.length > 0 && (
          <EmptyState>Nenhuma questão corresponde ao filtro</EmptyState>
        )}
        {visible.map((q) => {
          const state = getState(q);
          const dot = DOT[state];
          const originalIdx = questions.indexOf(q);
          return (
            <QItem
              key={q.identifier}
              $active={active === originalIdx}
              $state={state}
              onClick={() => { setActive(originalIdx); onQuestionClick?.(q.identifier); }}
            >
              <QNum $active={active === originalIdx}>{q.identifier}</QNum>
              <QText $active={active === originalIdx}>
                {q.questionText.replace(/<[^>]+>/g, '').slice(0, 50) || '(sem enunciado)'}
              </QText>
              <StatusDot $color={dot.color}>{dot.icon}</StatusDot>
            </QItem>
          );
        })}
      </List>

      {onAddQuestion && (
        <AddBtn onClick={onAddQuestion}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Nova questão
        </AddBtn>
      )}
    </Wrap>
  );
}
