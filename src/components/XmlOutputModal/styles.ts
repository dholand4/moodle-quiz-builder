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

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 0.8rem;
    margin-bottom: 0.8rem;
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--orange-500);
  color: #fff;
  font-size: 13px;
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.15s;
  box-shadow: 0 2px 6px rgba(0, 130, 155, 0.22);

  &:hover { background: var(--orange-600); }

  &.ghost {
    background: transparent;
    color: var(--ink-700);
    border: 1px solid var(--orange-200);
    box-shadow: none;

    &:hover { background: var(--orange-50); }
  }
`;

export const XmlBox = styled.pre`
  background: var(--orange-50);
  padding: 16px;
  border-radius: 10px;
  font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace;
  font-size: 12px;
  color: var(--ink-900);
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-top: 8px;
  max-height: 42vh;
  overflow-y: auto;
  border: 1px solid var(--orange-200);
  line-height: 1.6;

  &::-webkit-scrollbar { width: 0; height: 0; }
`;

export const WarningBox = styled.div`
  background: var(--warning-bg);
  border: 1px solid var(--yellow-soft, #FCEAB8);
  border-radius: 8px;
  padding: 8px 14px;
  margin-top: 12px;
  font-size: 12.5px;

  h4 {
    margin-top: 0;
    margin-bottom: 4px;
    color: var(--warning);
    font-size: 13px;
  }

  ul {
    padding-left: 18px;
    margin-bottom: 0;
    color: var(--ink-700);
  }
`;
