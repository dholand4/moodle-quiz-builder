import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &::-webkit-scrollbar { width: 0; }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div<{ $hasError?: boolean }>`
  border: 1px solid ${({ $hasError }) => ($hasError ? 'var(--danger)' : 'var(--orange-200)')};
  border-radius: 12px;
  overflow: hidden;
  background: var(--paper);
  box-shadow: ${({ $hasError }) => ($hasError ? '0 0 0 3px var(--danger-bg)' : 'none')};
`;

export const CardHeader = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--orange-100);
  background: ${({ $hasError }) => ($hasError ? 'var(--danger-bg)' : 'var(--paper-tint)')};
`;

export const CardLabel = styled.span<{ $hasError?: boolean }>`
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: ${({ $hasError }) => ($hasError ? 'var(--danger)' : 'var(--orange-500)')};
  letter-spacing: 0.04em;
`;

export const ErrorBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--paper);
  color: var(--danger);
`;

export const RemoveCardBtn = styled.button`
  background: none;
  border: none;
  color: var(--ink-400);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 2px 4px;
  margin-left: auto;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: var(--danger);
    background: var(--danger-bg);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-900);
  padding: 10px 12px 6px;
  resize: none;
  outline: none;
  min-height: 48px;
  line-height: 1.5;
  display: block;

  &::placeholder {
    color: var(--ink-400);
    font-weight: 400;
  }
`;

export const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 8px 8px;
`;

export const OptionRow = styled.div<{ $correct?: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 7px;
  border-radius: 7px;
  background: ${({ $correct }) => ($correct ? 'var(--success-bg)' : 'transparent')};
  border: 1px solid ${({ $correct }) => ($correct ? 'rgba(31,138,91,0.25)' : 'transparent')};
  transition: background 0.1s;
`;

export const OptionLetter = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: var(--syn-option);
  width: 14px;
  flex-shrink: 0;
`;

export const CorrectRadio = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--success);
  flex-shrink: 0;
`;

export const OptionInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 12.5px;
  font-family: inherit;
  color: var(--ink-900);
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--ink-400);
  }
`;

export const RemoveOptBtn = styled.button`
  background: none;
  border: none;
  color: var(--ink-300, var(--ink-400));
  cursor: pointer;
  font-size: 13px;
  padding: 0 2px;
  line-height: 1;
  border-radius: 3px;
  transition: color 0.2s;
  flex-shrink: 0;

  &:hover { color: var(--danger); }
`;

export const AddOptionBtn = styled.button`
  background: none;
  border: 1px dashed var(--orange-300);
  border-radius: 6px;
  color: var(--orange-600);
  padding: 3px 10px;
  font-size: 11.5px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2px;
  transition: background 0.15s;

  &:hover { background: var(--orange-50); }
`;

export const AddCardBtn = styled.button`
  border: 1.5px dashed var(--orange-300);
  border-radius: 10px;
  background: none;
  color: var(--orange-600);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  padding: 10px;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  grid-column: 1 / -1;

  &:hover { background: var(--orange-50); }
`;

export const ExportHint = styled.p`
  font-size: 11px;
  color: var(--ink-400);
  text-align: center;
  margin: 0;
  grid-column: 1 / -1;
`;
