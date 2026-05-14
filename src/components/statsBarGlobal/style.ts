import styled from 'styled-components';

export const Bar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 14px;
  background: #fff8f0;
  border: 1px solid #ffe0b2;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
`;

export const Stat = styled.span<{ $variant?: 'ok' | 'warn' | 'error' }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $variant }) =>
    $variant === 'error' ? '#b71c1c' :
    $variant === 'warn' ? '#e65100' :
    '#2e7d32'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Divider = styled.span`
  color: #e0c090;
  font-size: 0.85rem;
`;

export const IssueList = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  list-style: disc;
  width: 100%;
`;

export const IssueItem = styled.li`
  font-size: 0.82rem;
  color: #c62828;
  line-height: 1.5;
`;

export const AutosaveLabel = styled.span`
  font-size: 0.78rem;
  color: #999;
  margin-left: auto;
`;
