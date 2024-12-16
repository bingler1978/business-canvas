import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Socket } from 'socket.io-client';
import AiSuggestionModal from './AiSuggestionModal';

interface Note {
  id: string;
  text: string;
  position: SectionId;
  author: string;
  color: string;
}

interface CanvasProps {
  userId: string;
  socket: Socket;
  userColor: string;
  notes: Note[];
  onAddNote: (note: { text: string; position: SectionId }) => void;
  onDeleteNote: (noteId: string) => void;
  onGenerateAI: (sectionId: string) => void;
  getExampleContent: (section: string) => string;
}

type SectionId = 'kp' | 'ka' | 'vp' | 'cr' | 'cs' | 'kr' | 'ch' | 'c' | 'r';

interface Section {
  id: SectionId;
  name: string;
  title: string;
  gridArea: string;
}

const sections: readonly Section[] = [
  { id: 'kp', name: 'key-partners', title: '关键合作', gridArea: '1 / 1 / 3 / 3' },
  { id: 'ka', name: 'key-activities', title: '关键业务', gridArea: '1 / 3 / 2 / 5' },
  { id: 'kr', name: 'key-resources', title: '核心资源', gridArea: '2 / 3 / 3 / 5' },
  { id: 'vp', name: 'value-propositions', title: '价值主张', gridArea: '1 / 5 / 3 / 7' },
  { id: 'cr', name: 'customer-relationships', title: '客户关系', gridArea: '1 / 7 / 2 / 9' },
  { id: 'ch', name: 'channels', title: '渠道通路', gridArea: '2 / 7 / 3 / 9' },
  { id: 'cs', name: 'customer-segments', title: '客户细分', gridArea: '1 / 9 / 3 / 11' },
  { id: 'c', name: 'cost-structure', title: '成本结构', gridArea: '3 / 1 / 4 / 6' },
  { id: 'r', name: 'revenue-streams', title: '收入来源', gridArea: '3 / 6 / 4 / 11' }
] as const;

const CanvasContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: white;
  overflow: auto;
`;

const Section = styled.div<{ $area: string }>`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  grid-area: ${props => props.$area};
  display: flex;
  flex-direction: column;
  position: relative;
`;

const SectionHeader = styled.div`
  margin-bottom: 1rem;
  padding-right: 80px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #333;
`;

const TopButtonGroup = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
`;

const ActionButton = styled.button`
  background: #f0f0f0;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;

  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  }

  svg {
    width: 22px;
    height: 22px;
  }

  &:disabled {
    cursor: default;
    transform: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
`;

const AddButtonContainer = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
`;

const ButtonTooltip = styled.div`
  position: relative;

  &::after {
    content: attr(data-tooltip);
    display: none;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
  }

  &:hover::after {
    display: block;
  }
`;

const NotesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 48px;
  align-content: flex-start;
`;

const Tag = styled.div`
  background: ${props => props.color || '#4CAF50'};
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  max-width: calc(100% - 16px);
  margin: 4px;
  
  span {
    margin-right: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    font-size: 1.2rem;
    line-height: 1;
    opacity: 0.8;
    flex-shrink: 0;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const InputContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 0 20px;

  textarea {
    width: 100%;
    max-width: 300px;
    background: white;
  }
`;

const Input = styled.textarea`
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240, 240, 240, 0.9);
  border-radius: 50%;

  &::after {
    content: "";
    width: 16px;
    height: 16px;
    border: 2px solid #666;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
`;

const ExampleModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ExampleContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const ExampleList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ExampleItem = styled.div`
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  
  .keyword {
    color: #1976D2;
    font-weight: bold;
    margin-right: 8px;
  }
  
  .description {
    color: #666;
  }
`;

const examples: { [key in SectionId]: Array<{ title: string; description: string }> } = {
  kp: [
    { title: '定义', description: '建立和维护重要的商业伙伴关系网络，以优化商业模式的运作。通过合作伙伴关系来降低风险、获取资源或优化业务流程。' },
    { title: '供应商', description: '为企业提供关键资源的可靠供应商' },
    { title: '战略联盟', description: '与非竞争对手建立的战略合作关系' },
    { title: '合资企业', description: '共同开发新业务的合作伙伴' }
  ],
  ka: [
    { title: '定义', description: '为实现价值主张，企业必须开展的最重要活动。这些活动是企业成功运营所必需的关键行动。' },
    { title: '生产', description: '设计、制造和交付产品' },
    { title: '问题解决', description: '为客户提供新的解决方案' },
    { title: '平台/网络', description: '平台管理、服务供应和推广' }
  ],
  kr: [
    { title: '定义', description: '执行商业模式所需的最重要资产。这些资源让企业创造并提供价值主张、维护客户关系并创造收入。' },
    { title: '实物资产', description: '生产设施、建筑物、车辆和系统' },
    { title: '知识产权', description: '品牌、专利、版权和数据' },
    { title: '人力资源', description: '员工及其知识和创造力' }
  ],
  vp: [
    { title: '定义', description: '企业为特定客户群体创造的独特价值。解决客户问题或满足客户需求的产品和服务组合。' },
    { title: '新颖性', description: '满足全新的需求' },
    { title: '性能', description: '提升产品或服务性能' },
    { title: '定制化', description: '满足特定客户需求' }
  ],
  cr: [
    { title: '定义', description: '企业与特定客户群体建立和维护的关系类型。这些关系可以从自动化到个性化服务不等。' },
    { title: '个人支持', description: '通过员工与客户互动' },
    { title: '自助服务', description: '提供自助服务工具' },
    { title: '社区', description: '促进用户之间的互动' }
  ],
  ch: [
    { title: '定义', description: '企业如何与客户群体沟通并向其传递价值主张。包括沟通、分销和销售渠道。' },
    { title: '销售团队', description: '直接销售团队' },
    { title: '网络销售', description: '电子商务网站' },
    { title: '合作伙伴', description: '通过合作伙伴销售' }
  ],
  cs: [
    { title: '定义', description: '确定企业所服务的不同类型的客户群体。一个企业可以服务于一个或多个客户群体，每个群体可能有不同的需求和特征。' },
    { title: '大众市场', description: '面向广泛的客户群' },
    { title: '利基市场', description: '服务特定细分市场' },
    { title: '多边平台', description: '服务相互依赖的客户群' }
  ],
  c: [
    { title: '定义', description: '运营商业模式所产生的主要成本。创造和传递价值、维护客户关系和创造收入都会产生成本。' },
    { title: '固定成本', description: '工资、租金、设施' },
    { title: '可变成本', description: '原材料、销售佣金' },
    { title: '规模经济', description: '批量采购优惠' }
  ],
  r: [
    { title: '定义', description: '企业从各个客户群体获得的收入。企业必须思考每个客户群体愿意支付的价值。' },
    { title: '资产销售', description: '销售产品所有权' },
    { title: '使用费', description: '基于服务使用量收费' },
    { title: '订阅费', description: '持续访问服务的费用' }
  ]
};

const Canvas: React.FC<CanvasProps> = ({
  socket,
  userId,
  userColor,
  notes,
  onAddNote,
  onDeleteNote,
  onGenerateAI,
  getExampleContent
}) => {
  const [activeInput, setActiveInput] = useState<SectionId | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [loadingSection, setLoadingSection] = useState<SectionId | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ section: SectionId; content: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    socket.on('aiSuggestion', (data: { section: string; suggestion?: string; error?: string }) => {
      setLoadingSection(null);
      if (data.suggestion && sections.find(s => s.id === data.section)) {
        setAiSuggestion({
          section: data.section as SectionId,
          content: data.suggestion
        });
      }
    });

    return () => {
      socket.off('aiSuggestion');
    };
  }, [socket]);

  const handleAddClick = (sectionId: SectionId) => {
    setActiveInput(sectionId);
    setInputValue('');
    setTimeout(() => {
      const input = document.querySelector(`textarea[data-section="${sectionId}"]`) as HTMLTextAreaElement;
      if (input) {
        input.focus();
      }
    }, 0);
  };

  const handleAiClick = async (sectionId: SectionId) => {
    setLoadingSection(sectionId);
    try {
      await onGenerateAI(sectionId);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setLoadingSection(null);
    }
  };

  const handleExampleClick = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    setShowExampleModal(true);
  };

  const handleExampleModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowExampleModal(false);
      setActiveSection(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && activeInput) {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddNote({ text: inputValue.trim(), position: activeInput });
      }
      setActiveInput(null);
      setInputValue('');
    } else if (e.key === 'Escape') {
      setActiveInput(null);
      setInputValue('');
    }
  };

  const handleInputConfirm = (sectionId: SectionId) => {
    if (inputValue.trim()) {
      onAddNote({ text: inputValue.trim(), position: sectionId });
    }
    setActiveInput(null);
    setInputValue('');
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setInputValue('');
      setActiveInput(null);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    onDeleteNote(noteId);
  };

  const handleAcceptAiSuggestion = () => {
    if (aiSuggestion) {
      onAddNote({
        text: aiSuggestion.content,
        position: aiSuggestion.section
      });
      setAiSuggestion(null);
    }
  };

  const getSectionName = (sectionId: SectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : '';
  };

  return (
    <CanvasContainer>
      {sections.map(section => (
        <Section key={section.id} $area={section.gridArea}>
          <SectionHeader>
            <SectionTitle>{section.title}</SectionTitle>
          </SectionHeader>
          
          <TopButtonGroup>
            <ButtonTooltip data-tooltip="填写示例">
              <ActionButton onClick={() => handleExampleClick(section.id)}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C8.48 12.1 7 10.38 7 8.5 7 6.01 9.01 4 11.5 4S16 6.01 16 8.5c0 1.88-1.48 3.6-3.15 4.6z"/>
                </svg>
              </ActionButton>
            </ButtonTooltip>
            <ButtonTooltip data-tooltip="AI填写建议">
              <ActionButton 
                onClick={() => handleAiClick(section.id)} 
                disabled={loadingSection === section.id}
              >
                {loadingSection === section.id ? (
                  <LoadingSpinner />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.996.996 0 0 0-1.41 0L1.29 18.96a.996.996 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41l-2.33-2.35z"/>
                  </svg>
                )}
              </ActionButton>
            </ButtonTooltip>
          </TopButtonGroup>

          <NotesContainer>
            {notes
              .filter(note => note.position === section.id)
              .map(note => (
                <Tag key={note.id} color={note.color}>
                  <span>{note.text}</span>
                  {note.author === userId && (
                    <button onClick={() => handleDeleteNote(note.id)}>×</button>
                  )}
                </Tag>
              ))}
          </NotesContainer>

          <AddButtonContainer>
            <ButtonTooltip data-tooltip="增加内容">
              <ActionButton onClick={() => handleAddClick(section.id)}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
              </ActionButton>
            </ButtonTooltip>
          </AddButtonContainer>
        </Section>
      ))}

      {activeInput && (
        <InputContainer onClick={handleClickOutside}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            data-section={activeInput}
            placeholder="请输入内容，按回车键确认，按ESC键取消"
          />
        </InputContainer>
      )}

      {showExampleModal && activeSection && (
        <ExampleModal onClick={handleExampleModalClose}>
          <ExampleContent onClick={e => e.stopPropagation()}>
            <h3>{sections.find(s => s.id === activeSection)?.title} - 填写示例</h3>
            <ExampleList>
              {examples[activeSection].map((item, index) => (
                <ExampleItem key={index}>
                  <span className="keyword">{item.title}</span>
                  <span className="description">{item.description}</span>
                </ExampleItem>
              ))}
            </ExampleList>
          </ExampleContent>
        </ExampleModal>
      )}

      {aiSuggestion && (
        <AiSuggestionModal
          content={aiSuggestion.content}
          sectionName={sections.find(s => s.id === aiSuggestion.section)?.title || ''}
          onClose={() => setAiSuggestion(null)}
          onAccept={handleAcceptAiSuggestion}
        />
      )}
    </CanvasContainer>
  );
};

export default Canvas;
