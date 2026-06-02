import styled from 'styled-components';
import { QuizStats } from '../../hooks/useQuizStats';

interface BottomBarProps {
  stats: QuizStats;
  importLoading?: boolean;
  importError?: string;
}

const Bar = styled.footer`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 36px;
  flex-shrink: 0;
  background: var(--paper);
  border-top: 1px solid var(--orange-100);
  font-size: 11.5px;
  color: var(--ink-700);
  overflow: hidden;
`;

const Dot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const StatChip = styled.span<{ $variant: 'ok' | 'warn' | 'error' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: ${({ $variant }) =>
    $variant === 'ok'      ? 'var(--success)' :
    $variant === 'error'   ? 'var(--danger)'  :
    $variant === 'warn'    ? 'var(--warning)' :
    'var(--ink-500)'};
`;

const Mid = styled.div`flex: 1;`;

const Sep = styled.span`
  color: var(--orange-200);
  user-select: none;
`;

const LoadingText = styled.span`
  color: var(--warning);
  font-weight: 600;
`;

const ErrorText = styled.span`
  color: var(--danger);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
`;

export default function BottomBar({ stats, importLoading, importError }: BottomBarProps) {
  const ok = stats.total - stats.withoutAnswer - stats.withoutOptions;

  return (
    <Bar>
      {stats.total === 0 ? (
        <StatChip $variant="neutral">
          <Dot $color="var(--ink-400)" />
          Nenhuma questão detectada
        </StatChip>
      ) : (
        <>
          <StatChip $variant="ok">
            <Dot $color="var(--success)" />
            {ok} ok
          </StatChip>

          {stats.withoutAnswer > 0 && (
            <>
              <Sep>·</Sep>
              <StatChip $variant="error">
                <Dot $color="var(--danger)" />
                {stats.withoutAnswer} sem gabarito
              </StatChip>
            </>
          )}

          {stats.withoutOptions > 0 && (
            <>
              <Sep>·</Sep>
              <StatChip $variant="warn">
                <Dot $color="var(--warning)" />
                {stats.withoutOptions} sem alternativas
              </StatChip>
            </>
          )}

          <Sep>·</Sep>
          <StatChip $variant="neutral">
            {stats.total} {stats.total === 1 ? 'questão' : 'questões'}
          </StatChip>
        </>
      )}

      <Mid />

      {importLoading && <LoadingText>Processando arquivo...</LoadingText>}
      {!importLoading && importError && <ErrorText title={importError}>⚠ {importError}</ErrorText>}

    </Bar>
  );
}
