import React from 'react';
import * as S from './styles';

interface XmlOutputModalProps {
  visible: boolean;
  onClose: () => void;
  stats: { total: number; issues: string[] };
  xmlContent: string;
  filename: string;
  onCopy: () => void;
  onDownloadXML: () => void;
  onDownloadPDF: () => void;
}

const XmlOutputModal: React.FC<XmlOutputModalProps> = ({
  visible,
  onClose,
  stats,
  xmlContent,
  onCopy,
  onDownloadXML,
  onDownloadPDF,
}) => {
  if (!visible) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <S.Modal visible={visible} onClick={handleBackdrop}>
      <S.ModalContent>
        <h3>Conteúdo gerado</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>
          {stats.total} {stats.total === 1 ? 'questão gerada' : 'questões geradas'}
        </p>

        {stats.issues.length > 0 && (
          <S.WarningBox>
            <h4>Pontos de atenção</h4>
            <ul>
              {stats.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </S.WarningBox>
        )}

        <div className="actions">
          <S.Button onClick={onCopy} className="ghost">Copiar XML</S.Button>
          <S.Button onClick={onDownloadXML}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7M4 6l2.5 2.5L9 6M1.5 10v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Baixar XML
          </S.Button>
          <S.Button onClick={onDownloadPDF} className="ghost">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7M4 6l2.5 2.5L9 6M1.5 10v1a1 1 0 001 1h9a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Baixar PDF
          </S.Button>
        </div>

        <S.XmlBox>{xmlContent}</S.XmlBox>
      </S.ModalContent>
    </S.Modal>
  );
};

export default XmlOutputModal;
