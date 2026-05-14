import { useState, useCallback, useRef } from 'react';
import { parseTextToQuestions } from '../pages/Home/xmlParser';

export interface QuizStats {
  total: number;
  withoutAnswer: number;
  withoutOptions: number;
  issues: string[];
}

const EMPTY: QuizStats = { total: 0, withoutAnswer: 0, withoutOptions: 0, issues: [] };

export function useQuizStats() {
  const [stats, setStats] = useState<QuizStats>(EMPTY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!text.trim()) { setStats(EMPTY); return; }
      const questions = parseTextToQuestions(text);
      const issues: string[] = [];
      let withoutAnswer = 0;
      let withoutOptions = 0;

      questions.forEach((q) => {
        if (q.options.length === 0) {
          withoutOptions++;
          issues.push(`${q.identifier}: sem alternativas`);
        } else if (!q.correctAnswer) {
          withoutAnswer++;
          issues.push(`${q.identifier}: sem resposta correta`);
        }
      });

      setStats({ total: questions.length, withoutAnswer, withoutOptions, issues });
    }, 300);
  }, []);

  return { stats, update };
}
