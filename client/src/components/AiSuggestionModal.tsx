import React from 'react';
import styled from 'styled-components';
import MarkdownPreview from './MarkdownPreview';

interface AiSuggestionModalProps {
  content: string;
  onClose: () => void;
  onAccept: () => void;
  sectionName: string;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #eaecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #eaecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: #42b983;
    color: white;
    border: 1px solid #42b983;
    
    &:hover {
      background: #3aa876;
      border-color: #3aa876;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #ddd;
    
    &:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }
  `}
`;

const AiSuggestionModal: React.FC<AiSuggestionModalProps> = ({
  content,
  onClose,
  onAccept,
  sectionName
}) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <Title>AI 建议 - {sectionName}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <MarkdownPreview content={content} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>取消</Button>
          <Button $primary onClick={onAccept}>采用建议</Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AiSuggestionModal;
