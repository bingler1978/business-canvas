import React from 'react';
import styled from 'styled-components';

interface NoteProps {
  text: string;
  color: string;
  onDelete?: () => void;
  isOwner: boolean;
}

const NoteContainer = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  padding: 1rem;
  margin: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  min-width: 100px;
  max-width: 200px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  
  &:hover {
    background: #cc0000;
  }
`;

const NoteText = styled.p`
  margin: 0;
  color: ${props => props.color === '#ffffff' ? '#000000' : '#ffffff'};
  font-size: 0.9rem;
`;

const Note: React.FC<NoteProps> = ({ text, color, onDelete, isOwner }) => (
  <NoteContainer color={color}>
    {isOwner && onDelete && (
      <DeleteButton onClick={onDelete}>×</DeleteButton>
    )}
    <NoteText color={color}>{text}</NoteText>
  </NoteContainer>
);

export default Note;
