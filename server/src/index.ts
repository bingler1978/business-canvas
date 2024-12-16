import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import dotenv from 'dotenv';
import { SECTION_PROMPTS } from './prompts';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

interface Note {
  id: string;
  text: string;
  position: string;
  color: string;
  author: string;
}

interface User {
  id: string;
  color: string;
}

const notes: Note[] = [];
const users = new Map<string, User>();
const supplementsData = new Map<string, { id: string; text: string }>();

// Azure OpenAI configuration
let client: OpenAIClient | null = null;
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
  console.log('User connected');

  socket.on('join', (user: User) => {
    users.set(socket.id, user);
    io.emit('userList', { users: Array.from(users.values()) });
    // Send existing notes to the new user
    socket.emit('initialData', { notes });
  });

  socket.on('add_note', (note: Note) => {
    notes.push(note);
    io.emit('noteAdded', note);
  });

  socket.on('delete_note', (noteId: string) => {
    const index = notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      notes.splice(index, 1);
      io.emit('noteDeleted', { noteId });
    }
  });

  // AI 生成内容
  socket.on('requestAiSuggestion', async ({ section }: { section: string }) => {
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

      if (!client) {
        throw new Error('Azure OpenAI client not initialized');
      }

      console.log('Starting AI request with deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
      
      const result = await client.getChatCompletions(
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
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
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('userList', { users: Array.from(users.values()) });
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
