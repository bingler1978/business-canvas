# Changelog

所有重要的更改都会记录在这个文件中。

版本格式基于 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)，
并且这个项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2024-12-14

### 新增
- 基础商业画布功能
  - 九大模块的可视化展示
  - 支持添加和删除便签
  - 多用户实时协作
- AI 建议功能
  - 集成 Azure OpenAI 服务
  - 支持 Markdown 格式的建议内容
  - 美观的建议展示界面
- 用户系统
  - 基础的用户登录
  - 用户颜色标识
- 补充说明功能
  - 支持添加项目补充说明
  - 补充说明会被加入 AI 建议的上下文

### 技术栈
- 前端：React + TypeScript + Styled Components
- 后端：Node.js + Express
- 实时通信：Socket.IO
- AI：Azure OpenAI API

## [0.1.0] - 2024-12-14

### 新增
- 项目初始化
- 基础项目结构搭建
