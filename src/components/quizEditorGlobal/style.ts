import styled from 'styled-components';

export const Wrapper = styled.div<{ $isDragOver?: boolean }>`
  width: 100%;
  border-radius: 10px;
  border: 2px solid ${({ $isDragOver }) => ($isDragOver ? '#e65100' : '#ffb74a')};
  transition: border 0.3s ease, box-shadow 0.3s ease;
  background: #fff;
  margin-bottom: 10px;

  ${({ $isDragOver }) =>
    $isDragOver &&
    `
    background-color: #fffaf2;
    box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.16);
  `}

  &:focus-within {
    border-color: #df8468;
    box-shadow: 0 0 8px #e65100;
  }

  .cm-editor {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 1rem;
    min-height: 320px;
  }

  .cm-scroller {
    min-height: 320px;
  }

  .cm-content {
    padding: 10px 4px;
  }

  .cm-focused {
    outline: none;
  }

  .cm-line {
    padding: 0 4px;
  }

  /* Bold WYSIWYG */
  .cm-bold-text { font-weight: 700; }

  /* Syntax colors */
  .ͼb { color: #e65100; font-weight: 700; }  /* keyword = question header */
  .ͼc { color: #2e7d32; font-weight: 600; }  /* string = correct answer */
  .ͼd { color: #1565c0; }                     /* variableName = option */
  .ͼe { color: #6a1b9a; font-style: italic; } /* meta = image placeholder */
  .ͼf { font-weight: 700; }                   /* emphasis = *bold* */
`;

export const ShortcutBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 6px 12px;
  background: #fff8f0;
  border-bottom: 1px solid #ffe0b2;
  border-radius: 8px 8px 0 0;
  font-size: 0.78rem;
  color: #b46000;
  flex-wrap: wrap;

  kbd {
    background: #fff;
    border: 1px solid #ffcc80;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.75rem;
    font-family: monospace;
    color: #e65100;
  }
`;

export const BarSeparator = styled.span`
  color: #e0c090;
  user-select: none;
`;

export const BarButton = styled.button`
  background: none;
  border: none;
  color: #b46000;
  font-size: 0.78rem;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;

  kbd {
    background: #fff;
    border: 1px solid #ffcc80;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.75rem;
    font-family: monospace;
    color: #e65100;
    margin-right: 2px;
  }

  &:hover {
    background: #ffe0b2;
    color: #e65100;
  }
`;

export const BarBoldButton = styled.button`
  background: none;
  border: 1px solid #ffcc80;
  border-radius: 4px;
  color: #e65100;
  font-size: 0.85rem;
  font-weight: 700;
  width: 24px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  padding: 0;

  &:hover { background: #ffe0b2; }
`;

export const BarFileLabel = styled.label`
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  color: #e65100;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: #ffe0b2; }
`;

