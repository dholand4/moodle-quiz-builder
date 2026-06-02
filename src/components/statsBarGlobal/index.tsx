import { QuizStats } from '../../hooks/useQuizStats';
import * as S from './style';

interface IStatsBarProps {
  stats: QuizStats;
}

export default function statsBarGlobal({ stats }: IStatsBarProps) {
  const hasIssues = stats.withoutAnswer > 0 || stats.withoutOptions > 0;

  if (stats.total === 0) {
    return (
      <S.Bar>
        <S.Stat $variant="ok">Nenhuma questão detectada ainda</S.Stat>
      </S.Bar>
    );
  }

  return (
    <S.Bar>
      <S.Stat $variant={hasIssues ? 'warn' : 'ok'}>
        {stats.total} {stats.total === 1 ? 'questão' : 'questões'} detectada{stats.total !== 1 ? 's' : ''}
      </S.Stat>

      {stats.withoutAnswer > 0 && (
        <>
          <S.Divider>·</S.Divider>
          <S.Stat $variant="error">{stats.withoutAnswer} sem resposta correta</S.Stat>
        </>
      )}

      {stats.withoutOptions > 0 && (
        <>
          <S.Divider>·</S.Divider>
          <S.Stat $variant="error">{stats.withoutOptions} sem alternativas</S.Stat>
        </>
      )}

      {!hasIssues && (
        <>
          <S.Divider>·</S.Divider>
          <S.Stat $variant="ok">Tudo certo!</S.Stat>
        </>
      )}

      {hasIssues && stats.issues.length > 0 && (
        <S.IssueList>
          {stats.issues.map((issue) => (
            <S.IssueItem key={issue}>{issue}</S.IssueItem>
          ))}
        </S.IssueList>
      )}
    </S.Bar>
  );
}
