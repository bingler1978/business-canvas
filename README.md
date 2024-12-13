# Business Model Canvas

一个协作式商业模式画布工具，帮助团队共同构建和完善商业模式。

## 功能特点

- 实时协作：多人可以同时编辑画布
- AI 辅助：提供智能建议，帮助完善商业模式
- 响应式设计：适配各种屏幕尺寸
- 直观的用户界面：拖放操作，简单易用

## 技术栈

### 前端
- React with TypeScript
- Styled Components
- Socket.IO Client
- React Icons

### 后端
- Node.js
- Express
- Socket.IO
- Azure OpenAI

## 安装和运行

### 前端

```bash
cd client
npm install
npm start
```

### 后端

```bash
cd server
npm install
npm start
```

## 环境变量

### 前端 (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

### 后端 (.env)
```
PORT=3001
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

## 项目结构

```
business_canvas/
├── client/                 # 前端代码
│   ├── public/            # 静态文件
│   └── src/               # React 源代码
│       ├── components/    # React 组件
│       └── styles/        # 样式文件
└── server/                # 后端代码
    └── src/               # Node.js 源代码
```

## 开发指南

1. 遵循 TypeScript 类型定义
2. 使用 ESLint 和 Prettier 保持代码风格一致
3. 提交代码前进行本地测试
4. 保持良好的代码注释

## License

MIT
