import styled from 'styled-components';

type EditorMode = 'text' | 'card';

interface TopBarProps {
  activeMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onImport: () => void;
  onGenerateXML: () => void;
  onGeneratePDF: () => void;
  onInfo: () => void;
  shuffleAnswers: boolean;
  onToggleShuffle: () => void;
  filename: string;
  onFilenameChange: (name: string) => void;
}

const Wrap = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 52px;
  padding: 0 18px;
  flex-shrink: 0;
  background: var(--paper);
  border-bottom: 1px solid var(--orange-100);
  z-index: 10;
`;

const LogoMark = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  text-decoration: none;
`;

const LogoNames = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
`;

const LogoName = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: var(--orange-500);
  letter-spacing: -0.005em;
`;

const LogoTagline = styled.span`
  font-size: 10px;
  color: var(--ink-500);
`;

const Sep = styled.div`
  width: 1px;
  height: 24px;
  background: var(--orange-100);
  flex-shrink: 0;
`;

const Pills = styled.nav`
  display: inline-flex;
  background: var(--orange-100);
  border-radius: 999px;
  padding: 3px;
  gap: 0;
`;

const PillBtn = styled.button<{ $active?: boolean }>`
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  border: none;
  background: ${({ $active }) => ($active ? 'var(--orange-500)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--orange-600)')};
  box-shadow: ${({ $active }) => ($active ? '0 1px 2px rgba(0,130,155,0.25)' : 'none')};
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: -0.005em;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--orange-500)' : 'rgba(0,163,187,0.10)')};
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--orange-200);
  color: var(--ink-700);
  font-family: inherit;
  font-weight: 600;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--orange-50);
  }
`;

const CtaBtn = styled.button<{ $ghost?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 32px;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.15s;

  ${({ $ghost }) => $ghost ? `
    background: transparent;
    border: 1px solid var(--orange-400);
    color: var(--orange-600);
    box-shadow: none;
    &:hover { background: var(--orange-50); }
  ` : `
    background: var(--orange-500);
    border: none;
    color: #fff;
    box-shadow: 0 2px 6px rgba(0,130,155,0.25);
    &:hover { background: var(--orange-600); }
  `}
`;

const ShuffleLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;
  color: var(--ink-700);
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
`;

const Toggle = styled.span<{ $on: boolean }>`
  position: relative;
  display: inline-block;
  width: 28px;
  height: 15px;
  border-radius: 999px;
  background: ${({ $on }) => ($on ? 'var(--orange-500)' : 'var(--ink-200)')};
  transition: background 0.2s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $on }) => ($on ? '14px' : '2px')};
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.18s;
  }
`;

const FilenameInput = styled.input`
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-900);
  outline: none;
  min-width: 60px;
  max-width: 220px;
  width: auto;
  padding: 2px 6px;
  border-radius: 5px;
  transition: background 0.15s;

  &:hover {
    background: var(--orange-50);
  }

  &:focus {
    background: var(--orange-50);
    box-shadow: 0 0 0 1.5px var(--orange-300);
  }
`;

const InfoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--orange-200);
  color: var(--ink-500);
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    background: var(--orange-50);
    color: var(--orange-500);
  }
`;

export default function TopBar({ activeMode, onModeChange, onImport, onGenerateXML, onGeneratePDF, onInfo, shuffleAnswers, onToggleShuffle, filename, onFilenameChange }: TopBarProps) {
  return (
    <Wrap>
      <LogoMark>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="7" fill="var(--orange-500)" />
          <rect x="6" y="7" width="16" height="2.5" rx="1.25" fill="white" />
          <rect x="6" y="12" width="11" height="2.5" rx="1.25" fill="white" />
          <rect x="6" y="17" width="13" height="2.5" rx="1.25" fill="white" />
        </svg>
        <LogoNames>
          <LogoName>Quiz Moodle</LogoName>
          <LogoTagline>Gerador de XML</LogoTagline>
        </LogoNames>
      </LogoMark>

      <Sep />

      <FilenameInput
        value={filename}
        onChange={(e) => onFilenameChange(e.target.value)}
        onBlur={(e) => { if (!e.target.value.trim()) onFilenameChange('Quiz sem título'); }}
        title="Clique para renomear"
        size={Math.max(10, filename.length)}
      />

      <Sep />

      <Pills>
        <PillBtn $active={activeMode === 'text'} onClick={() => onModeChange('text')}>
          Texto livre
        </PillBtn>
        <PillBtn $active={activeMode === 'card'} onClick={() => onModeChange('card')}>
          Editor por cards
        </PillBtn>
      </Pills>

      <ActionsRow>
        <InfoBtn onClick={onInfo} title="Ajuda e instruções">ⓘ</InfoBtn>
        <GhostBtn onClick={onImport} title="Importar PDF ou Word (.docx)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Importar
        </GhostBtn>
        <Sep />
        <ShuffleLabel title="Embaralhar alternativas ao gerar XML">
          <Toggle $on={shuffleAnswers} onClick={onToggleShuffle} />
          Embaralhar
        </ShuffleLabel>
        <CtaBtn $ghost onClick={onGeneratePDF} title="Baixar PDF">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v7M4 6l2.5 2.5L9 6M1.5 10v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          PDF
        </CtaBtn>
        <CtaBtn onClick={onGenerateXML} title="Baixar XML">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5h10M2 9h10M5 2l-3 5 3 5M9 2l3 5-3 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          XML
        </CtaBtn>
      </ActionsRow>
    </Wrap>
  );
}
