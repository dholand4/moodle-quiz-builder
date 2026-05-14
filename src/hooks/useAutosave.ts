import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'moodle_quiz_autosave';

export function useAutosave(getValue: () => string, interval = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const text = getValue();
      try {
        localStorage.setItem(STORAGE_KEY, text);
      } catch {
        // quota exceeded — silently ignore
      }
    }, interval);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { schedule };
}

export function loadAutosaved(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function clearAutosaved(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
