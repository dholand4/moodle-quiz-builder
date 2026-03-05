// src/components/InfoModal/styles.ts
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
  overflow-y: auto;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.5s ease-out;

  h3 {
    color: #bf360c;
    font-size: 1.7rem;
    font-weight: 600;
    margin-bottom: 0.5px;
  }
`;

export const ModalPre = styled.div`
  background-color: #fff8f0;
  padding: 18px;
  border-left: 4px solid #ffb74d;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.95em;
  overflow-x: auto;
  margin-top: 1rem;
`;
