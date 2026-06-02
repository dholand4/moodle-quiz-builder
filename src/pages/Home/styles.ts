import styled from 'styled-components';

export const Container = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 48px 56px;
  max-width: 1400px;
  width: calc(100% - 48px);
  border-radius: 20px;
  margin: 1.5rem auto;
  border: 1px solid #ffb74a;
  box-sizing: border-box;
`;

export const Title = styled.h1`
  color: #e65100;
  font-size: 1.7rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Buttoninfo = styled.button`
  background: none;
  border: none;
  color: #c26d00;
  font-size: 1.25rem;
  margin-left: 8px;
  margin-top: 5px;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0 5px;

  &:hover {
    color: #7a2e00;
  }
`;

export const QuestionContainer = styled.div`
  width: 100%;
`;

export const ModePanel = styled.div<{ $dir: 'left' | 'right' }>`
  width: 100%;
  animation: ${({ $dir }) => ($dir === 'right' ? 'fadeSlideLeft' : 'fadeSlideRight')} 0.2s ease;

  @keyframes fadeSlideRight {
    from { opacity: 0; transform: translateX(28px) scale(0.99); }
    to   { opacity: 1; transform: translateX(0)    scale(1); }
  }

  @keyframes fadeSlideLeft {
    from { opacity: 0; transform: translateX(-28px) scale(0.99); }
    to   { opacity: 1; transform: translateX(0)     scale(1); }
  }
`;

export const ModeSwitcher = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: #fff8f0;
  border: 1px solid #ffe0b2;
  border-radius: 30px;
  padding: 4px;
`;

export const ModeBtn = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg, #fb8c00, #e65100)' : 'none')};
  color: ${({ $active }) => ($active ? '#fff' : '#e65100')};
  border: none;
  border-radius: 24px;
  padding: 6px 18px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? 'linear-gradient(135deg, #fb8c00, #e65100)' : '#fff3e0')};
  }
`;

export const Textarea = styled.textarea<{ $isDragOver?: boolean }>`
  width: 100%;
  min-height: 170px;
  border-radius: 10px;
  border: 2px solid ${({ $isDragOver }) => ($isDragOver ? '#e65100' : '#ffb74a')};
  padding: 10px;
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  resize: vertical;
  transition: border 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  margin-bottom: 10px;

  &:focus {
    border-color: #df8468;
    box-shadow: 0 0 8px #e65100;
    outline: none;
  }

  ${({ $isDragOver }) =>
    $isDragOver &&
    `
    background-color: #fffaf2;
    box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.16);
  `}
`;

export const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 12px;
  margin-top: 16px;
`;

export const UploadRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
`;

export const ImageUploadContainer = styled.div`
  label {
    display: inline-block;
    background-color: #fff3e0;
    color: #e65100;
    padding: 8px 16px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid #ffcc80;

    &:hover {
      background-color: #ffe0b2;
    }
  }

  input[type='file'] {
    display: none;
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  margin-bottom: 5px;
  
  label {
    font-size: 0.92rem;
    color: #333;
    cursor: pointer;
  }

  input[type='checkbox'] {
    cursor: pointer;
    transform: scale(1.1);
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #fb8c00, #e65100);
  color: #fff;
  font-size: 1rem;
  padding: 10px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  width: 100%;
  max-width: 340px;
  margin-top: 10px;
  margin-bottom: -10px;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 15px rgba(251, 140, 0, 0.35);
  }
`;

export const StatusText = styled.p`
  font-size: 0.9rem;
  color: #b71c1c;
  margin: 0;
  text-align: center;
`;

export const Footer = styled.footer`
  color: #e65100;
  text-align: center;
  width: 100%;
  font-size: 0.82em;
  font-weight: 500;
  margin-top: -8px;
`;


export const ImagePreview = styled.div`
  position: fixed;
  z-index: 9999;
  border: 1px solid #ccc;
  background: #fff;
  padding: 4px;
  border-radius: 4px;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;
