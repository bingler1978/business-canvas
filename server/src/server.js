require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { SYSTEM_PROMPT, SECTION_PROMPTS } = require('./prompts');

const app = express();
const server = http.createServer(app);

// 配置 CORS
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// 配置 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  pingTimeout: 60000,
  transports: ['websocket', 'polling']
});

// 存储补充资料的 Map
const supplementsData = new Map();
// 存储便签的数组
const notesData = [];

// 在线用户管理
const onlineUsers = new Map();

// Azure OpenAI configuration
let client = null;
try {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  
  console.log('Initializing Azure OpenAI client with:');
  console.log('Endpoint:', endpoint);
  console.log('API Key:', apiKey ? 'Present' : 'Missing');
  
  if (!endpoint || !apiKey) {
    throw new Error('Missing Azure OpenAI credentials');
  }
  
  client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  console.log('Azure OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Azure OpenAI client:', error);
}

io.on('connection', (socket) => {
  console.log('Client connected');

  // 用户加入
  socket.on('join', (data) => {
    console.log('User joined:', data);
    onlineUsers.set(socket.id, data);
    io.emit('userList', { users: Array.from(onlineUsers.values()) });
    
    // 发送现有的便签给新用户
    socket.emit('initialNotes', { notes: notesData });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    const userData = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit('userList', { users: Array.from(onlineUsers.values()) });
  });

  // AI 生成内容
  socket.on('requestAiSuggestion', async ({ section }) => {
    try {
      const prompt = SECTION_PROMPTS[section];
      if (!prompt) {
        throw new Error('Invalid section');
      }

      const supplements = Array.from(supplementsData.values())
        .map(s => s.text)
        .join('\n');

      const messages = [
        { role: "system", content: "你是一个专业的商业模式分析专家，擅长使用商业画布工具分析商业模式。请用 Markdown 格式回答，包含标题、要点和详细说明。" },
        { role: "user", content: `补充资料：\n${supplements || '暂无补充资料'}\n\n${prompt}` }
      ];

      console.log('Starting AI request with deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
      
      const result = await client.getChatCompletions(
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
        messages
      );

      console.log('AI Response received:', result.choices[0].message.content);
      socket.emit('aiSuggestion', { 
        section, 
        suggestion: result.choices[0].message.content 
      });
      
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      socket.emit('aiSuggestion', { 
        section, 
        error: error.message 
      });
    }
  });

  // 添加笔记
  socket.on('addNote', ({ note }) => {
    console.log('Adding note:', note);
    notesData.push(note);
    io.emit('noteAdded', note);
  });

  // 删除笔记
  socket.on('deleteNote', ({ noteId }) => {
    const index = notesData.findIndex(note => note.id === noteId);
    if (index !== -1) {
      notesData.splice(index, 1);
    }
    io.emit('noteDeleted', { noteId });
  });

  // 添加补充资料
  socket.on('addSupplement', (supplement) => {
    supplementsData.set(supplement.id, supplement);
    io.emit('supplementAdded', supplement);
  });

  // 删除补充资料
  socket.on('deleteSupplement', ({ supplementId }) => {
    supplementsData.delete(supplementId);
    io.emit('supplementDeleted', { supplementId });
  });

  // 清空补充资料
  socket.on('clearSupplements', () => {
    supplementsData.clear();
    io.emit('supplementsCleared');
  });
});

// Simple test endpoint for AI
app.post('/api/test-ai', async (req, res) => {
  try {
    if (!client) {
      throw new Error('Azure OpenAI client not initialized');
    }

    console.log('Starting AI request with deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
    
    const messages = [
      { role: "system", content: "You are a helpful business consultant." },
      { role: "user", content: "How many people does a consulting company need?" }
    ];

    const result = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      messages
    );

    console.log('AI Response received:', result.choices[0].message.content);
    res.json({ response: result.choices[0].message.content });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
