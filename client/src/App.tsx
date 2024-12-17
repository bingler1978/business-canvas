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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  width: 100%;  
  z-index: 1000;
`;

const ParticipantItem = styled.div<{ $isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$isSelected ? '#f8f9fa' : 'transparent'};
  
  &:hover {
    background: #f8f9fa;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  color: #2196F3;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  
  &:hover {
    background: #f5f5f5;
    border-radius: 4px;
  }

  .icon {
    font-size: 16px;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  color: #dc3545;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #f5f5f5;
    border-radius: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

const SupplementItem = styled.div<{ $expanded: boolean }>`
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
  }

  .content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  span {
    flex: 1;
    margin-right: 8px;
    ${props => !props.$expanded && `
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
    ${props => props.$expanded && `
      white-space: pre-wrap;
    `}
  }

  .delete-button {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .delete-button {
    opacity: 1;
  }
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

interface Supplement {
  id: string;
  text: string;
  expanded?: boolean;
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
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const titleInputRef = useRef<HTMLInputElement>(null);
  const supplementInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const socket = useRef(socketService.connect()).current;

  useEffect(() => {
    if (!socket || !isLoggedIn) return;

    socket.emit('join', { id: userId, color: userColor });

    const eventHandlers = {
      initialData: (data: { notes: Note[] }) => {
        setNotes(data.notes);
      },
      noteAdded: (note: Note) => {
        setNotes(prev => [...prev, note]);
      },
      noteDeleted: ({ noteId }: { noteId: string }) => {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      },
      userList: ({ users }: { users: User[] }) => {
        setOnlineUsers(users);
      },
      aiSuggestion: (data: { section: string; suggestion?: string; error?: string }) => {
        console.log('Received AI suggestion:', data);
        if (data.error) {
          alert(`AI生成错误: ${data.error}`);
        }
      }
    }
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach(event => {
        socket.off(event);
      });
    };
  }, [socket, isLoggedIn, userId, userColor]);

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
    console.log('发送添加便签请求:', note);
    const newNote: Note = {
      id: Date.now().toString(),
      text: note.text,
      position: note.position,
      color: userColor,
      author: userId
    };
    console.log('准备发送的便签数据:', newNote);
    socket.emit('addNote', { note: newNote });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!socket || !isLoggedIn) return;
    socket.emit('deleteNote', noteId);
  };

  const handleGenerateAI = (sectionId: string) => {
    if (socket) {
      console.log('Requesting AI suggestion for:', sectionId);
      socket.emit('requestAiSuggestion', { section: sectionId });
    }
  };

  const handleSupplementButtonClick = () => {
    setShowSupplementModal(true);
    setTimeout(() => {
      supplementInputRef.current?.focus();
    }, 0);
  };

  const handleSupplementInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && supplementInput.trim()) {
      if (supplements.length >= 100) {
        alert('最多只能添加100条补充资料');
        return;
      }
      const newSupplement = {
        id: Date.now().toString(),
        text: supplementInput.trim(),
        expanded: false
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/plain') {
      alert('请上传文本文件(.txt)');
      return;
    }

    if (supplements.length >= 100) {
      alert('最多只能添加100条补充资料');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const remainingSlots = 100 - supplements.length;
      const linesToAdd = lines.slice(0, remainingSlots);

      linesToAdd.forEach((line, index) => {
        const newSupplement = {
          id: Date.now().toString() + '-' + index,
          text: line.trim(),
          expanded: false
        };
        socket.emit('addSupplement', newSupplement);
      });

      if (lines.length > remainingSlots) {
        alert(`由于100条限制，只添加了前${remainingSlots}条内容`);
      }
    } catch (error) {
      alert('读取文件失败');
    }
    
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  const handleSupplementClick = (id: string) => {
    setSupplements(prev => prev.map(item => 
      item.id === id ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const getExampleContent = (section: string) => {
    const examples: { [key: string]: string } = {
      'key-partners': '关键合作伙伴\n\n定义：建立和维护重要的商业伙伴关系网络，以优化商业模式的运作。\n\n示例：\n- 供应商和供货商\n- 战略联盟伙伴\n- 合资企业',
      'key-activities': '关键业务\n\n定义：为实现价值主张，企业必须开展的最重要活动。\n\n示例：\n- 产品开发和创新\n- 平台维护和运营\n- 供应链管理',
      'key-resources': '核心资源\n\n定义：执行商业模式所需的最重要资产。\n\n示例：\n- 人力资源\n- 知识产权\n- 品牌资源\n- 技术设施',
      'value-propositions': '价值主张\n\n定义：企业为特定客户群体创造的独特价值。\n\n示例：\n- 产品创新性\n- 性能优势\n- 定制化服务\n- 一站式解决方案',
      'customer-relationships': '客户关系\n\n定义：企业与特定客户群体建立和维护的关系类型。\n\n示例：\n- 个性化服务\n- 自助服务\n- 社区互动\n- 会员制度',
      'channels': '渠道通路\n\n定义：企业如何与客户群体沟通并向其传递价值主张。\n\n示例：\n- 线上渠道\n- 实体店铺\n- 分销网络\n- 合作伙伴渠道',
      'customer-segments': '客户细分\n\n定义：确定企业所服务的不同类型的客户群体。\n\n示例：\n- 大众市场\n- 细分市场\n- 多边平台\n- 特定行业客户',
      'cost-structure': '成本结构\n\n定义：运营商业模式所产生的主要成本。\n\n示例：\n- 固定成本\n- 可变成本\n- 规模经济\n- 范围经济',
      'revenue-streams': '收入来源\n\n定义：企业从各个客户群体获得的收入。\n\n示例：\n- 产品销售\n- 使用费\n- 订阅费\n- 广告收入'
    };
    return examples[section] || '点击添加内容';
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
          <SupplementButton onClick={handleSupplementButtonClick}>
            <span className="icon">📋</span>
            <span>补充说明</span>
          </SupplementButton>
          <ParticipantsButton onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}>
            <span className="icon">👥</span>
            <span>参与者</span>
            <ParticipantsDropdown $isOpen={showParticipantsDropdown}>
              {onlineUsers
                .filter(user => user.id !== userId)
                .map(user => (
                  <ParticipantItem
                    key={user.id}
                    $isSelected={selectedParticipants.has(user.id)}
                    onClick={() => toggleParticipant(user.id)}
                  >
                    <ColorDot color={user.color} />
                    <span>{user.id}</span>
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
        getExampleContent={getExampleContent}
      />
      {showSupplementModal && (
        <SupplementModal onClick={handleSupplementModalClose}>
          <SupplementContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>补充资料</ModalTitle>
              <ButtonGroup>
                <UploadButton onClick={handleUploadClick}>
                  <span className="icon">📄</span>
                  <span>上传文件</span>
                </UploadButton>
                <ClearButton onClick={handleClearSupplements}>
                  <span>清空</span>
                </ClearButton>
              </ButtonGroup>
            </ModalHeader>
            <FileInput 
              type="file" 
              accept=".txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <SupplementInput
              ref={supplementInputRef}
              type="text"
              value={supplementInput}
              onChange={e => setSupplementInput(e.target.value)}
              onKeyDown={handleSupplementInputKeyDown}
              placeholder="输入补充资料，按回车添加"
            />
            <SupplementList>
              {supplements.map(supplement => (
                <SupplementItem 
                  key={supplement.id} 
                  $expanded={!!supplement.expanded}
                  onClick={() => handleSupplementClick(supplement.id)}
                >
                  <div className="content">
                    <span>{supplement.text}</span>
                    <DeleteButton 
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSupplement(supplement.id);
                      }}
                    >
                      ×
                    </DeleteButton>
                  </div>
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
