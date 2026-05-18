import styled from 'styled-components';

export const Wrapper = styled.div<{ $isDragOver?: boolean }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--paper);
  border: none;
  transition: box-shadow 0.2s;

  ${({ $isDragOver }) =>
    $isDragOver &&
    `box-shadow: inset 0 0 0 3px var(--orange-300);`}

  /* @uiw/react-codemirror renders a wrapper div around .cm-editor */
  & > div {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .cm-editor {
    font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace;
    font-size: 13.5px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .cm-scroller {
    flex: 1;
    min-height: 0;
    overflow-y: auto !important;
  }

  .cm-content {
    padding: 14px 4px;
    min-height: 100%;
  }

  .cm-focused {
    outline: none;
  }

  .cm-line {
    padding: 0 6px;
    line-height: 22px;
  }

  /* Bold WYSIWYG */
  .cm-bold-text { font-weight: 700; }

  /* Syntax colours — mapped via quizLanguage.ts tags */
  .ͼb { color: var(--syn-header); font-weight: 700; }   /* question header */
  .ͼc { color: var(--syn-correct); font-weight: 600; }  /* correct answer marker */
  .ͼd { color: var(--syn-option); }                     /* option letter */
  .ͼe { color: var(--syn-image); font-style: italic; }  /* image placeholder */
  .ͼf { font-weight: 700; }                             /* bold */
`;

export const ShortcutBar = styled.div`
  display: none; /* shortcuts now live in RightPane / BottomBar */
`;

export const BarSeparator = styled.span`
  color: var(--orange-200);
  user-select: none;
`;

export const BarButton = styled.button`
  background: none;
  border: none;
  color: var(--ink-500);
  font-size: 11.5px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  font-family: inherit;

  kbd {
    background: var(--paper-tint);
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 10.5px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    color: var(--ink-700);
    margin-right: 3px;
  }

  &:hover {
    background: var(--orange-50);
    color: var(--orange-500);
  }
`;

export const BarBoldButton = styled.button`
  background: none;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  color: var(--orange-500);
  font-size: 13px;
  font-weight: 700;
  width: 24px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  padding: 0;

  &:hover { background: var(--orange-50); }
`;

export const BarFileLabel = styled.label`
  background: var(--paper-tint);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  color: var(--ink-700);
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  font-family: inherit;

  &:hover { background: var(--orange-50); color: var(--orange-600); }
`;
