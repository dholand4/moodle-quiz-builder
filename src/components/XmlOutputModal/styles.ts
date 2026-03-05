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
  padding-top: 5vh;
`;

export const ModalContent = styled.div`
  background: linear-gradient(to bottom, #ffffff, #fff3e0);
  padding: 30px;
  width: 85%;
  max-width: 900px;
  border-radius: 15px;
  text-align: left;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.5s ease-out;

  h3 {
    color: #bf360c;
    font-size: 1.7rem;
    font-weight: 600;
    margin-bottom: 0.5px;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #fb8c00, #e65100);
  color: #fff;
  font-size: 1rem;
  padding: 10px 25px;
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
  padding: 20px;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-top: 10px;
  max-height: 45vh;
  overflow-y: auto;
  border: 1px solid #ffd8a8;
`;

export const WarningBox = styled.div`
  background-color: #fff4e5;
  border: 1px solid #ffcc80;
  border-radius: 4px;
  padding: 8px 16px;
  margin-top: 16px;
  font-size: 0.9em;

  h4 {
    margin-top: 0;
    color: #ef6c00;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 0;
  }
`;
