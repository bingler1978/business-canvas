# 商业画布应用部署指南

## 项目概述
- 项目名称：商业模式画布（Business Model Canvas）
- 版本：v1.0.3
- 技术栈：
  - 前端：React + TypeScript + Socket.IO Client
  - 后端：Node.js + Express + Socket.IO
  - AI服务：Azure OpenAI

## 系统要求
- Node.js >= 16.x
- npm >= 8.x
- 内存：至少 2GB RAM
- 存储：至少 1GB 可用空间

## 项目结构
```
business_canvas/
├── client/             # 前端项目
│   ├── src/
│   ├── package.json
│   └── .env
└── server/             # 后端项目
    ├── src/
    ├── package.json
    └── .env
```

## 环境变量配置

### 后端环境变量 (server/.env)
```
PORT=3001
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

### 前端环境变量 (client/.env)
```
REACT_APP_SERVER_URL=http://your_server_ip:3001
```

## 部署步骤

### 1. 后端部署
1. 安装依赖：
```bash
cd server
npm install
```

2. 配置环境变量：
- 复制 `.env.example` 为 `.env`
- 填入正确的 Azure OpenAI 配置信息

3. 启动服务：
```bash
# 开发环境
npm start

# 生产环境（建议使用 PM2）
pm2 start src/server.js --name business-canvas-server
```

### 2. 前端部署
1. 安装依赖：
```bash
cd client
npm install
```

2. 修改配置：
- 在 `src/services/socket.ts` 中更新服务器地址
- 确保 `.env` 中的 `REACT_APP_SERVER_URL` 指向正确的后端地址

3. 构建生产版本：
```bash
npm run build
```

4. 部署 `build` 目录到 Web 服务器（如 Nginx）

### 3. Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 前端静态文件
    location / {
        root /path/to/client/build;
        try_files $uri $uri/ /index.html;
    }

    # 后端代理
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 验证部署
1. 访问前端页面（http://your_domain.com）
2. 测试以下功能：
   - 用户登录
   - 添加/删除便签
   - AI 建议生成
   - 多用户同步
   - 补充资料管理

## 注意事项
1. 确保防火墙允许 3001 端口（WebSocket 通信）
2. 配置 SSL 证书以支持 HTTPS
3. 设置适当的 CORS 策略
4. 建议使用 PM2 管理 Node.js 进程
5. 定期备份数据（目前数据存储在内存中）

## 监控和日志
- 使用 PM2 监控后端进程
- 检查 Nginx 访问日志和错误日志
- 监控 WebSocket 连接状态
- 关注 Azure OpenAI API 调用限制

## 回滚方案
如需回滚到之前版本：
```bash
git checkout v1.0.2  # 或其他稳定版本
```

## 技术支持
如遇到问题，请联系：[您的联系方式]

## 更新日志
v1.0.3 更新内容：
- 添加便签持久化存储
- 实现新用户自动同步已有便签
- 优化 WebSocket 连接管理
- 保持 AI 功能稳定性
