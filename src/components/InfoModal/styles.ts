import styled, { keyframes } from 'styled-components';

interface ModalProps {
  visible: boolean;
}

const slideIn = keyframes`
  from { transform: translateY(-16px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

export const Modal = styled.div<ModalProps>`
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgba(31, 20, 12, 0.45);
  backdrop-filter: blur(4px);
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
`;

export const ModalContent = styled.div`
  background: var(--paper);
  padding: 24px 28px;
  width: 90%;
  max-width: 740px;
  border-radius: 16px;
  text-align: left;
  display: flex;
  flex-direction: column;
  max-height: 82vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(31, 20, 12, 0.18);
  border: 1px solid var(--orange-200);
  animation: ${slideIn} 0.25s ease-out;

  h3 {
    color: var(--orange-600);
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }

  &::-webkit-scrollbar { width: 0; }
`;

export const ModalPre = styled.div`
  background: var(--orange-50);
  padding: 14px;
  border-left: 3px solid var(--orange-400);
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  overflow-x: auto;
  margin-top: 0.8rem;
  color: var(--ink-900);
`;
