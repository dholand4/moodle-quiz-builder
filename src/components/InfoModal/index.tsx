import React from 'react';
import * as S from './styles';

interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
    if (!visible) return null;

    const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (

        <S.Modal visible={visible} onClick={handleClose}>
            <S.ModalContent>
                <h3>Como Utilizar o Sistema</h3>
                <p style={{ marginBottom: 0 }}>
                    Este sistema permite gerar questões no formato XML compatível com o Moodle. Para utilizá-lo corretamente, siga as instruções abaixo:
                </p>
                <ul>
                    <li>Digite suas questões no campo de texto, utilizando uma linha para cada pergunta.</li>
                    <li>Cada questão deve começar com a numeração sequencial, como <strong>1.</strong>, <strong>2.</strong>, etc.</li>
                    <li>Inclua as alternativas utilizando letras de <strong>a)</strong> em diante. Você pode usar quantas alternativas desejar, desde que cada uma siga o formato <code>a)</code>, <code>b)</code>, <code>c)</code>, etc.</li>
                    <li>Marque a alternativa correta com <code>{'{correta}'}</code> ou <code>{'{correto}'}</code>.</li>
                </ul>
                <S.ModalPre>
                    1. Qual é a capital do Brasil?<br />
                    a) São Paulo<br />
                    b) Rio de Janeiro<br />
                    c) Brasília <strong>{'{correta}'}</strong><br />
                    d) Salvador<br />
                    e) Belo Horizonte<br /><br />

                    2. Qual é a capital do estado do Ceará?<br />
                    a) Sobral<br />
                    b) Juazeiro do Norte<br />
                    c) Crato<br />
                    d) Fortaleza <strong>{'{correto}'}</strong><br />
                    e) Quixadá<br />
                </S.ModalPre>
                <p>Após inserir todas as questões, clique no botão <strong>"Gerar XML"</strong>.</p>
            </S.ModalContent>
        </S.Modal>
    );
};

export default InfoModal;