import styled from 'styled-components';

export const SplitContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  align-items: flex-start;
`;

export const EditorPane = styled.div`
  flex: 1;
  min-width: 0;
`;

export const PreviewPane = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 370px;
  border-radius: 10px;
  border: 2px solid #ffe0b2;
  padding: 14px 18px;
  background: #fffaf5;
  overflow-y: auto;
  max-height: 80vh;
  box-sizing: border-box;
  font-size: 0.93rem;
  color: #333;
`;

export const PreviewTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #b46000;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  border-bottom: 1px solid #ffe0b2;
  padding-bottom: 4px;
`;

export const QuestionCard = styled.div<{ $hasError?: boolean }>`
  margin-bottom: 18px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ffcdd2' : '#ffe0b2')};
`;

export const QuestionHeader = styled.div`
  font-weight: 700;
  color: #e65100;
  margin-bottom: 6px;
  font-size: 0.82rem;
`;

export const QuestionText = styled.p`
  margin: 0 0 8px;
  font-size: 0.9rem;
  line-height: 1.5;
`;

export const OptionRow = styled.div<{ $correct?: boolean }>`
  padding: 2px 0;
  font-size: 0.88rem;
  color: ${({ $correct }) => ($correct ? '#2e7d32' : '#444')};
  font-weight: ${({ $correct }) => ($correct ? '600' : '400')};

  &::before {
    content: ${({ $correct }) => ($correct ? '"✓ "' : '"   "')};
    white-space: pre;
  }
`;

export const ErrorBadge = styled.span`
  font-size: 0.75rem;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: 6px;
`;

export const EmptyState = styled.div`
  color: #bbb;
  font-style: italic;
  font-size: 0.9rem;
  padding: 20px 0;
  text-align: center;
`;
