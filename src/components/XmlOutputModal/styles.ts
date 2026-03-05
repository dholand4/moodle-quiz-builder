import styled, { keyframes } from 'styled-components';

interface ModalProps {
  visible: boolean;
}

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Modal = styled.div<ModalProps>`
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  justify-content: center;
  align-items: flex-start;
  padding-top: 4vh;
`;

export const ModalContent = styled.div`
  background: linear-gradient(to bottom, #ffffff, #fff3e0);
  padding: 24px;
  width: 82%;
  max-width: 780px;
  border-radius: 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  max-height: 78vh;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.5s ease-out;

  h3 {
    color: #bf360c;
    font-size: 1.45rem;
    font-weight: 600;
    margin-bottom: 0.5px;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 0.8rem;
    margin-bottom: 0.8rem;
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #fb8c00, #e65100);
  color: #fff;
  font-size: 0.92rem;
  padding: 8px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    transform: scale(1.05);
  }
`;

export const XmlBox = styled.pre`
  background-color: #fff8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.92rem;
  color: #333;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-top: 8px;
  max-height: 42vh;
  overflow-y: auto;
  border: 1px solid #ffd8a8;
`;

export const WarningBox = styled.div`
  background-color: #fff4e5;
  border: 1px solid #ffcc80;
  border-radius: 4px;
  padding: 7px 14px;
  margin-top: 12px;
  font-size: 0.84em;

  h4 {
    margin-top: 0;
    color: #ef6c00;
  }

  ul {
    padding-left: 18px;
    margin-bottom: 0;
  }
`;
