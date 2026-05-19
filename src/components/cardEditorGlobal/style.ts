import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;

  &::-webkit-scrollbar { width: 0; }
`;

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 820px;
  margin: 0 auto;
`;

export const Card = styled.div<{ $hasError?: boolean; $isOk?: boolean }>`
  border-radius: 12px;
  background: var(--paper);
  border: 1px solid ${({ $hasError }) => ($hasError ? 'var(--danger)' : 'var(--orange-100)')};
  border-left: 4px solid ${({ $hasError, $isOk }) =>
    $hasError ? 'var(--danger)' : $isOk ? 'var(--success)' : 'var(--orange-200)'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
`;

export const CardHeader = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 10px;
  background: ${({ $hasError }) => ($hasError ? 'var(--danger-bg)' : 'var(--paper-tint)')};
  border-bottom: 1px solid ${({ $hasError }) => ($hasError ? 'rgba(199,64,46,0.15)' : 'var(--orange-100)')};
`;

export const CardLabel = styled.span<{ $hasError?: boolean; $isOk?: boolean }>`
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: ${({ $hasError, $isOk }) =>
    $hasError ? 'var(--danger)' : $isOk ? 'var(--success)' : 'var(--orange-500)'};
  letter-spacing: 0.04em;
`;

export const ErrorBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--paper);
  color: var(--danger);
  border: 1px solid rgba(199,64,46,0.2);
`;

export const RemoveCardBtn = styled.button`
  background: none;
  border: none;
  color: var(--ink-400);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 2px 5px;
  margin-left: auto;
  border-radius: 5px;
  transition: color 0.15s, background 0.15s;
  &:hover { color: var(--danger); background: var(--danger-bg); }
`;

export const TextArea = styled.textarea`
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink-900);
  padding: 12px 14px 10px;
  resize: none;
  outline: none;
  overflow: hidden;
  min-height: 52px;
  line-height: 1.6;
  display: block;

  &::placeholder { color: var(--ink-400); font-weight: 400; }
`;

export const OptionsDivider = styled.div`
  height: 1px;
  background: var(--orange-100);
  margin: 0 14px;
`;

export const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 10px 10px;
`;

export const OptionRow = styled.div<{ $correct?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 6px;
  border-radius: 8px;
  background: ${({ $correct }) => ($correct ? 'var(--success-bg)' : 'transparent')};
  border: 1px solid ${({ $correct }) => ($correct ? 'rgba(31,138,91,0.2)' : 'transparent')};
  transition: background 0.1s;
  margin-bottom: 2px;
`;

export const OptionLetter = styled.span<{ $correct?: boolean }>`
  font-size: 10.5px;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: ${({ $correct }) => ($correct ? 'var(--success)' : 'var(--syn-option)')};
  width: 16px;
  flex-shrink: 0;
  padding-top: 6px;
`;

export const CorrectRadio = styled.input`
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: var(--success);
  flex-shrink: 0;
  margin-top: 7px;
`;

export const OptionTextArea = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  font-family: inherit;
  color: var(--ink-900);
  outline: none;
  min-width: 0;
  resize: none;
  overflow: hidden;
  min-height: 28px;
  line-height: 1.55;
  padding: 4px 0;

  &::placeholder { color: var(--ink-400); }
`;

export const RemoveOptBtn = styled.button`
  background: none;
  border: none;
  color: var(--ink-300, var(--ink-400));
  cursor: pointer;
  font-size: 13px;
  padding: 0 3px;
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
  margin-top: 5px;
  transition: color 0.15s;
  &:hover { color: var(--danger); }
`;

export const AddOptionBtn = styled.button`
  align-self: flex-start;
  background: none;
  border: 1px dashed var(--orange-200);
  border-radius: 6px;
  color: var(--ink-500);
  padding: 3px 12px;
  font-size: 11.5px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  margin-left: 39px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  &:hover {
    background: var(--orange-50);
    color: var(--orange-600);
    border-color: var(--orange-300);
  }
`;

export const AddCardBtn = styled.button`
  border: 1.5px dashed var(--orange-200);
  border-radius: 12px;
  background: none;
  color: var(--ink-500);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  padding: 14px;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    background: var(--orange-50);
    color: var(--orange-600);
    border-color: var(--orange-300);
  }
`;

export const ExportHint = styled.p`
  font-size: 11px;
  color: var(--ink-400);
  text-align: center;
  margin: 0;
`;
