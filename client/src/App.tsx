import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import LoginForm from './components/LoginForm';
import Canvas from './components/Canvas';
import socketService from './services/socket';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const HeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BaseHeaderButton = styled.button`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 6px 12px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #ced4da;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 500px;
  width: 90%;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const SupplementButton = styled(BaseHeaderButton)``;

const ParticipantsButton = styled(BaseHeaderButton)`
  position: relative;
`;

const UserCount = styled(BaseHeaderButton)`
  cursor: default;
  
  &:hover {
    background: white;
    border-color: #dee2e6;
  }
`;

const UserTag = styled(BaseHeaderButton)<{ color: string }>`
  background: ${props => props.color};
  border-color: ${props => props.color};
  color: white;
  
  &:hover {
    background: ${props => props.color};
    border-color: ${props => props.color};
    opacity: 0.9;
  }
`;

const ParticipantsDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 200px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  z-index: 1000;
`;

const ParticipantItem = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  ${props => props.$isSelected && `
    background: #e9ecef;
    font-weight: 500;
  `}

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const ColorDot = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const Title = styled.h1`
  margin: 0;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserList = styled.div`
  position: relative;
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  min-width: 200px;
  z-index: 1000;
`;

const UserItem = styled.div<{ color: string }>`
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.color};
  }
  
  &:hover {
    background: #f5f5f5;
  }
`;

const SupplementModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const SupplementContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    color: #c82333;
  }
`;

const SupplementInput = styled.input`
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
`;

const SupplementList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SupplementItem = styled.div`
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover {
    color: #c82333;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1000;
  
  &:before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.8);
  }
`;

const UserTagWrapper = styled.div`
  position: relative;
  
  &:hover ${Tooltip} {
    opacity: 1;
  }
`;

type SectionId = 'kp' | 'ka' | 'vp' | 'cr' | 'cs' | 'kr' | 'ch' | 'c' | 'r';

interface Note {
  id: string;
  text: string;
  position: SectionId;
  color: string;
  author: string;
}

interface User {
  id: string;
  color: string;
}

interface Participant {
  id: string;
  nickname: string;
  color: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [userColor, setUserColor] = useState('#' + Math.floor(Math.random()*16777215).toString(16));
  const [notes, setNotes] = useState<Note[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('商业模式画布');
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [supplementInput, setSupplementInput] = useState('');
  const [supplements, setSupplements] = useState<Array<{ id: string; text: string }>>([]);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const titleInputRef = useRef<HTMLInputElement>(null);
  const supplementInputRef = useRef<HTMLInputElement>(null);

  const participants: Participant[] = [
    { id: 'user1', nickname: '用户1', color: '#4CAF50' },
    { id: 'user2', nickname: '用户2', color: '#2196F3' },
    { id: 'user3', nickname: '用户3', color: '#FF9800' },
    { id: 'user4', nickname: '用户4', color: '#9C27B0' },
  ];

  const currentUser = { id: 'user1', nickname: '用户1', color: '#4CAF50' };

  const socket = socketService.connect();

  useEffect(() => {
    if (isLoggedIn) {
      socket.emit('join', { id: userId, color: userColor });

      socket.on('userList', (data: { users: User[] }) => {
        setOnlineUsers(data.users);
      });

      socket.on('noteAdded', (data) => {
        console.log('Received note data:', data);
        setNotes(prev => [...prev, data]);
      });

      socket.on('noteDeleted', (data: { noteId: string }) => {
        setNotes(prev => prev.filter(note => note.id !== data.noteId));
      });

      socket.on('supplementAdded', (data: { id: string; text: string }) => {
        setSupplements(prev => [...prev, data]);
      });

      socket.on('supplementDeleted', (data: { supplementId: string }) => {
        setSupplements(prev => prev.filter(s => s.id !== data.supplementId));
      });

      socket.on('supplementsCleared', () => {
        setSupplements([]);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [isLoggedIn, userId, userColor]);

  const handleLogin = (nickname: string) => {
    setUserId(nickname);
    setIsLoggedIn(true);
  };

  const handleColorChange = () => {
    const colors = [
      '#4CAF50', // 绿色
      '#2196F3', // 蓝色
      '#FF9800', // 橙色
      '#E91E63', // 粉红色
      '#9C27B0', // 紫色
      '#00BCD4', // 青色
      '#FF5722', // 深橙色
      '#795548', // 棕色
      '#607D8B', // 蓝灰色
      '#3F51B5'  // 靛蓝色
    ];
    const currentIndex = colors.indexOf(userColor);
    const nextColor = colors[(currentIndex + 1) % colors.length];
    setUserColor(nextColor);
    
    // 更新所有属于当前用户的便签颜色
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.author === userId 
          ? { ...note, color: nextColor }
          : note
      )
    );
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  };

  const handleAddNote = (note: { text: string; position: SectionId }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text: note.text,
      position: note.position,
      color: userColor,
      author: userId
    };
    socket.emit('addNote', { note: newNote });
  };

  const handleDeleteNote = (noteId: string) => {
    socket.emit('deleteNote', { noteId });
  };

  const handleGenerateAI = (sectionId: string) => {
    if (socket) {
      console.log('Requesting AI suggestion for:', sectionId);
      socket.emit('requestAiSuggestion', { section: sectionId });
    }
  };

  const handleSupplementClick = () => {
    setShowSupplementModal(true);
    setTimeout(() => {
      supplementInputRef.current?.focus();
    }, 0);
  };

  const handleSupplementInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && supplementInput.trim()) {
      const newSupplement = {
        id: Date.now().toString(),
        text: supplementInput.trim()
      };
      socket.emit('addSupplement', newSupplement);
      setSupplementInput('');
    }
  };

  const handleDeleteSupplement = (supplementId: string) => {
    socket.emit('deleteSupplement', { supplementId });
  };

  const handleClearSupplements = () => {
    socket.emit('clearSupplements');
  };

  const handleSupplementModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowSupplementModal(false);
    }
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  };

  // 过滤无效的笔记
  const validNotes = notes.filter((note): note is Note => 
    note !== null && 
    typeof note === 'object' && 
    typeof note.author === 'string'
  );

  // 过滤可见的笔记
  const visibleNotes = isLoggedIn ? validNotes.filter(note => 
    note.author === userId || selectedParticipants.has(note.author)
  ) : [];

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AppContainer>
      <Header>
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'black',
              fontSize: '2em',
              fontWeight: 'bold',
              width: '300px'
            }}
          />
        ) : (
          <Title onClick={handleTitleClick}>{title}</Title>
        )}
        <HeaderGroup>
          <SupplementButton onClick={() => setShowSupplementModal(true)}>
            <span className="icon">📝</span>
            <span>补充说明</span>
          </SupplementButton>
          <ParticipantsButton onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}>
            <span className="icon">👥</span>
            <span>参与者</span>
            <ParticipantsDropdown $isOpen={showParticipantsDropdown}>
              {participants
                .filter(p => p.id !== currentUser.id)
                .map(participant => (
                  <ParticipantItem
                    key={participant.id}
                    $isSelected={selectedParticipants.has(participant.id)}
                    onClick={() => toggleParticipant(participant.id)}
                  >
                    <ColorDot color={participant.color} />
                    <span>{participant.nickname}</span>
                  </ParticipantItem>
                ))}
            </ParticipantsDropdown>
          </ParticipantsButton>
          <UserCount>
            <span className="icon">👤</span>
            <span>在线: {onlineUsers.length}</span>
          </UserCount>
          <UserTagWrapper>
            <UserTag color={userColor} onClick={handleColorChange}>
              <span className="icon">🎨</span>
              <span>{userId}</span>
            </UserTag>
            <Tooltip>点击我更换颜色</Tooltip>
          </UserTagWrapper>
        </HeaderGroup>
      </Header>
      <Canvas
        socket={socket}
        userId={userId}
        userColor={userColor}
        notes={visibleNotes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onGenerateAI={(sectionId: string) => handleGenerateAI(sectionId)}
      />
      {showSupplementModal && (
        <SupplementModal onClick={handleSupplementModalClose}>
          <SupplementContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>补充资料</ModalTitle>
              <ClearButton onClick={handleClearSupplements}>
                <span>🗑️</span>
                <span>清空</span>
              </ClearButton>
            </ModalHeader>
            <SupplementInput
              ref={supplementInputRef}
              type="text"
              value={supplementInput}
              onChange={(e) => setSupplementInput(e.target.value)}
              onKeyDown={handleSupplementInputKeyDown}
              placeholder="输入补充信息，按回车添加"
            />
            <SupplementList>
              {supplements.map(item => (
                <SupplementItem key={item.id}>
                  <span>{item.text}</span>
                  <DeleteButton onClick={() => handleDeleteSupplement(item.id)}>×</DeleteButton>
                </SupplementItem>
              ))}
            </SupplementList>
          </SupplementContent>
        </SupplementModal>
      )}
    </AppContainer>
  );
}

export default App;
