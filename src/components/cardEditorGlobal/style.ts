import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

export const Card = styled.div`
  border: 1px solid #ffe0b2;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  position: relative;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const CardLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #e65100;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const RemoveCardBtn = styled.button`
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.2s;

  &:hover { color: #c62828; }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 64px;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  padding: 8px;
  font-size: 0.93rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  resize: vertical;
  box-sizing: border-box;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #fb8c00;
    box-shadow: 0 0 0 2px rgba(251,140,0,0.15);
  }
`;

export const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const OptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const OptionInput = styled.input`
  flex: 1;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 0.9rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  &:focus {
    outline: none;
    border-color: #fb8c00;
    box-shadow: 0 0 0 2px rgba(251,140,0,0.15);
  }
`;

export const CorrectRadio = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2e7d32;
`;

export const OptionLetter = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: #1565c0;
  width: 18px;
  flex-shrink: 0;
`;

export const RemoveOptBtn = styled.button`
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;

  &:hover { color: #c62828; }
`;

export const AddOptionBtn = styled.button`
  background: none;
  border: 1px dashed #ffcc80;
  border-radius: 6px;
  color: #fb8c00;
  padding: 4px 10px;
  font-size: 0.83rem;
  cursor: pointer;
  margin-top: 4px;
  transition: background 0.2s;

  &:hover { background: #fff3e0; }
`;

export const AddCardBtn = styled.button`
  border: 2px dashed #ffb74a;
  border-radius: 10px;
  background: none;
  color: #e65100;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;

  &:hover { background: #fff3e0; }
`;

export const ExportHint = styled.p`
  font-size: 0.78rem;
  color: #aaa;
  text-align: center;
  margin: 0;
`;
