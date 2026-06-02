import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Question } from '../../pages/Home/xmlParser';

export interface RecentImport {
  name: string;
  count: number;
  status: 'done' | 'error' | 'parsing';
  time: Date;
}

type Tab = 'preview' | 'shortcuts' | 'imports';
type EditorMode = 'text' | 'card';

interface RightPaneProps {
  questions: Question[];
  imageMap: Record<string, string>;
  imageVersion: number;
  recentImports: RecentImport[];
  activeMode: EditorMode;
}

const DEFAULT_TAB: Record<EditorMode, Tab> = {
  text: 'preview',
  card: 'preview',
};

/* ── Shell ────────────────────────────────────────────── */
const Pane = styled.aside`
  width: 300px;
  flex-shrink: 0;
  background: var(--paper);
  border-left: 1px solid var(--orange-100);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  gap: 2px;
  padding: 9px 9px 0;
  border-bottom: 1px solid var(--orange-100);
  flex-shrink: 0;
`;

const TabBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border-radius: 7px 7px 0 0;
  border: none;
  margin-bottom: -1px;
  background: ${({ $active }) => ($active ? 'var(--orange-50)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--orange-600)' : 'var(--ink-500)')};
  border-bottom: ${({ $active }) => ($active ? '2px solid var(--orange-500)' : '2px solid transparent')};
  font-family: inherit;
  font-weight: 600;
  font-size: 11.5px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: var(--orange-50);
    color: var(--orange-600);
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::-webkit-scrollbar { width: 0; }
`;

const SectionLabel = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  color: var(--ink-500);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
`;

/* ── Preview tab ──────────────────────────────────────── */
const PreviewCard = styled.div<{ $hasError?: boolean }>`
  background: var(--paper-tint);
  border-radius: 10px;
  border: 1px solid ${({ $hasError }) => ($hasError ? 'var(--danger)' : 'var(--orange-100)')};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewQHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
`;

const PreviewQId = styled.span`
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--orange-500);
`;

const ErrorTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--danger-bg);
  color: var(--danger);
`;

const PreviewQText = styled.div`
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--ink-900);

  p {
    margin: 0 0 6px;
    &:last-child { margin-bottom: 0; }
  }

  img {
    max-width: 100%;
    max-height: 80px;
    border-radius: 6px;
    display: block;
    margin-top: 4px;
  }
`;

const OptionItem = styled.div<{ $correct?: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 7px;
  font-size: 12px;
  border: ${({ $correct }) => ($correct ? '1.5px solid var(--success)' : '1px solid var(--orange-100)')};
  background: ${({ $correct }) => ($correct ? 'var(--success-bg)' : 'var(--bg-2)')};
  color: ${({ $correct }) => ($correct ? 'var(--success)' : 'var(--ink-900)')};
  font-weight: ${({ $correct }) => ($correct ? '600' : '400')};
`;

const RadioDot = styled.span<{ $correct?: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid ${({ $correct }) => ($correct ? 'var(--success)' : 'var(--ink-200)')};
  background: ${({ $correct }) => ($correct ? 'var(--success)' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

function resolveImages(text: string, imageMap: Record<string, string>): string {
  return text.replace(/\[(imagem\d+)\]/gi, (_match, id: string) => {
    const src = imageMap[id];
    return src ? `<img src="${src}" />` : `<code>[${id}]</code>`;
  });
}

function PreviewTab({ questions, imageMap }: { questions: Question[]; imageMap: Record<string, string> }) {
  if (questions.length === 0) {
    return (
      <div style={{ color: 'var(--ink-400)', fontSize: 12, textAlign: 'center', padding: '20px 0', lineHeight: 1.6 }}>
        As questões aparecerão aqui conforme você digita no editor
      </div>
    );
  }

  return (
    <>
      <SectionLabel>Como aparece no Moodle · {questions.length} {questions.length === 1 ? 'questão' : 'questões'}</SectionLabel>
      {questions.map((q) => {
        const hasError = !q.correctAnswer || q.options.length === 0;
        return (
          <PreviewCard key={q.identifier} $hasError={hasError}>
            <PreviewQHeader>
              <PreviewQId>{q.identifier}</PreviewQId>
              {!q.correctAnswer && q.options.length > 0 && <ErrorTag>sem gabarito</ErrorTag>}
              {q.options.length === 0 && <ErrorTag>sem alternativas</ErrorTag>}
            </PreviewQHeader>
            <PreviewQText
              dangerouslySetInnerHTML={{ __html: resolveImages(q.questionText || '(sem enunciado)', imageMap) }}
            />
            {q.options.map((opt) => (
              <OptionItem key={opt.letter} $correct={opt.letter === q.correctAnswer}>
                <RadioDot $correct={opt.letter === q.correctAnswer}>
                  {opt.letter === q.correctAnswer && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.2 5.8L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </RadioDot>
                <span style={{ fontSize: 11, fontWeight: 700, color: opt.letter === q.correctAnswer ? 'var(--success)' : 'var(--syn-option)', width: 14 }}>
                  {opt.letter})
                </span>
                {opt.text}
              </OptionItem>
            ))}
          </PreviewCard>
        );
      })}
    </>
  );
}

/* ── Shortcuts tab ────────────────────────────────────── */
const MonoBox = styled.div`
  padding: 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
  line-height: 1.7;
  border-radius: 8px;
  background: var(--orange-50);
  border: 1px solid var(--orange-100);
`;

const ShortcutRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
`;

const ShortcutLabel = styled.span`
  flex: 1;
  color: var(--ink-700);
`;

const KbdGroup = styled.span`
  display: flex;
  gap: 3px;
`;

function ShortcutsTab() {
  const shortcuts = [
    ['Inserir modelo',  ['Ctrl', 'Q']],
    ['Buscar',          ['Ctrl', 'F']],
    ['Substituir',      ['Ctrl', 'H']],
    ['Negrito',         ['Ctrl', 'B']],
    ['Desfazer',        ['Ctrl', 'Z']],
    ['Refazer',         ['Ctrl', 'Y']],
  ] as [string, string[]][];

  return (
    <>
      <SectionLabel>Sintaxe do formato</SectionLabel>
      <MonoBox>
        <div><span style={{ color: 'var(--syn-header)', fontWeight: 700 }}>1.</span> Texto da pergunta</div>
        <div><span style={{ color: 'var(--syn-option)' }}>a)</span> Opção A</div>
        <div><span style={{ color: 'var(--syn-option)' }}>c)</span> Brasília <span style={{ color: 'var(--syn-correct)' }}>{'{correto}'}</span></div>
        <div><span style={{ color: 'var(--syn-image)' }}>[imagem1]</span> inline</div>
        <div><span style={{ fontWeight: 700 }}>**negrito**</span> e <span style={{ fontStyle: 'italic' }}>_itálico_</span></div>
      </MonoBox>

      <SectionLabel style={{ marginTop: 6 }}>Atalhos de teclado</SectionLabel>
      {shortcuts.map(([label, keys]) => (
        <ShortcutRow key={label}>
          <ShortcutLabel>{label}</ShortcutLabel>
          <KbdGroup>
            {keys.map((k) => <span key={k} className="kbd">{k}</span>)}
          </KbdGroup>
        </ShortcutRow>
      ))}
    </>
  );
}

/* ── Imports tab ──────────────────────────────────────── */
const ImportRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--paper-tint);
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const ImportIcon = styled.div<{ $status: 'done' | 'error' | 'parsing' }>`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  background: ${({ $status }) =>
    $status === 'done' ? 'var(--success-bg)' :
    $status === 'error' ? 'var(--danger-bg)' :
    'var(--orange-50)'};
  color: ${({ $status }) =>
    $status === 'done' ? 'var(--success)' :
    $status === 'error' ? 'var(--danger)' :
    'var(--orange-500)'};
`;

const ImportInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ImportName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImportSub = styled.div`
  font-size: 10.5px;
  color: var(--ink-500);
`;

function ImportsTab({ imports }: { imports: RecentImport[] }) {
  if (imports.length === 0) {
    return (
      <div style={{ color: 'var(--ink-400)', fontSize: 12, textAlign: 'center', padding: '20px 0', lineHeight: 1.6 }}>
        Nenhum arquivo importado ainda.<br/>Use o botão <strong>Importar</strong> no topo.
      </div>
    );
  }

  return (
    <>
      <SectionLabel>Importações recentes</SectionLabel>
      {imports.map((imp, i) => (
        <ImportRow key={i}>
          <ImportIcon $status={imp.status}>
            {imp.status === 'error' ? '⚠' : imp.status === 'parsing' ? '⋯' : '✓'}
          </ImportIcon>
          <ImportInfo>
            <ImportName title={imp.name}>{imp.name}</ImportName>
            <ImportSub>
              {imp.status === 'done' && `${imp.count} questões detectadas`}
              {imp.status === 'error' && 'Formato não reconhecido'}
              {imp.status === 'parsing' && 'Processando…'}
            </ImportSub>
          </ImportInfo>
        </ImportRow>
      ))}
    </>
  );
}

/* ── Main export ──────────────────────────────────────── */
export default function RightPane({ questions, imageMap, imageVersion: _iv, recentImports, activeMode }: RightPaneProps) {
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB[activeMode]);

  useEffect(() => {
    setTab(DEFAULT_TAB[activeMode]);
  }, [activeMode]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'preview',   label: 'Preview' },
    { key: 'shortcuts', label: 'Atalhos' },
    { key: 'imports',   label: 'Importações' },
  ];

  return (
    <Pane>
      <TabBar>
        {tabs.map((t) => (
          <TabBtn key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </TabBtn>
        ))}
      </TabBar>
      <Body>
        {tab === 'preview'   && <PreviewTab questions={questions} imageMap={imageMap} />}
        {tab === 'shortcuts' && <ShortcutsTab />}
        {tab === 'imports'   && <ImportsTab imports={recentImports} />}
      </Body>
    </Pane>
  );
}
