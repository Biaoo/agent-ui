# Agent UI Demo

一个基于 [AG-UI 协议](https://docs.ag-ui.com) 的 AI Agent 用户界面演示项目。

**[English](./README.md)** | 中文

## 为什么做这个项目

在开发 AI Agent 应用的过程中，我逐渐意识到一个被忽视的问题：**虽然 Agent 返回的事件流是文本形式，但其中包含了多种不同类型的内容——思考过程、工具调用、中间结果、最终响应。前端该如何优雅地呈现这些信息？**

传统的聊天界面显然不够用了。用户需要看到 Agent 的"思考过程"，需要在关键节点做出决策（Human-in-the-Loop），需要理解工具调用的输入输出。我意识到，这可能需要一套全新的 **Agent 与 UI 之间的通信协议**。

带着这个问题，我开始调研业界的解决方案。[CopilotKit](https://copilotkit.ai) 提供了优秀的前端集成范式，[AG-UI Protocol](https://docs.ag-ui.com) 则定义了 Agent 与 UI 之间的标准化通信协议。本项目正是基于这些框架的探索与实践，旨在验证 Agent UI 的各种交互模式。

## 已实现的 Agent UI 功能

1. **工具调用前端交互组件** - 以搜索工具为例，展示 Agent 调用工具时的 UI 交互流程
2. **Human-in-the-Loop 交互组件** - `AskUserQuestion` 组件，支持 Agent 暂停并向用户提问
3. **工具调用详情双栏布局** - 左侧对话流、右侧工具调用详情的分栏展示
4. **自定义 Markdown 样式** - 优化搜索结果中引用源的展示效果

## 演示

https://github.com/user-attachments/assets/f479516c-9d92-4a3e-8dad-b82e2677d4b3

## 快速开始

### 前置要求

- Python 3.12+
- Node.js 18+
- uv (Python 包管理器)

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/Biaoo/agent-ui
cd agent-ui

# 一键安装
./scripts/setup.sh

# 启动开发服务器
./start-dev.sh

```

或手动安装：

```bash
# 后端
cd backend
uv venv --python 3.12
source .venv/bin/activate
uv pip install -e .
cp .env.example .env  # 编辑添加 API 密钥

# 前端
cd frontend
npm install
```

启动服务：

```bash
# 后端 (终端 1)
cd backend && source .venv/bin/activate && app-dev

# 前端 (终端 2)
cd frontend && npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 环境变量

在 `backend/.env` 中配置：

```env
# 必需：DashScope (Qwen 模型)
DASHSCOPE_API_KEY=your_key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 可选：Tavily 搜索工具
TAVILY_API_KEY=your_key
```

> 如需使用其他模型（如 OpenAI），请修改 `backend/src/config/model_config.py`

## 项目结构

```
agent-ui-project/
├── backend/                 # Python 后端 (Agno + FastAPI)
│   ├── src/
│   │   ├── agents/         # Agent 实现 (Chat, Search)
│   │   ├── tools/          # 工具实现 (Tavily, HITL)
│   │   └── server.py       # AgentOS 服务器
│   └── AGENTS.md           # 后端开发指南
├── frontend/                # TypeScript 前端 (Next.js + CopilotKit)
│   ├── app/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面 (Chat, Search)
│   │   └── api/copilotkit/ # CopilotKit 运行时
│   └── AGENTS.md           # 前端开发指南
├── docs/                    # 项目文档
│   ├── MULTI_AGENT_SETUP.md
│   └── implementation/     # 实现记录
└── AGENTS.md               # 项目总体开发指南
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | [Agno](https://docs.agno.com) + FastAPI |
| 前端框架 | Next.js 16 + React 19 |
| Agent 通信 | [AG-UI Protocol](https://docs.ag-ui.com) |
| 前端集成 | [CopilotKit](https://copilotkit.ai) |
| 样式 | Tailwind CSS 4 |
| LLM | Qwen (DashScope) / OpenAI |

## 文档

- [AGENTS.md](./AGENTS.md) - 项目开发指南
- [后端开发](./backend/AGENTS.md) - Agent 和工具开发
- [前端开发](./frontend/AGENTS.md) - 组件和页面开发

## 致谢

- [Agno](https://docs.agno.com) - AI Agent 开发框架
- [AG-UI Protocol](https://docs.ag-ui.com) - Agent-UI 通信协议
- [CopilotKit](https://copilotkit.ai) - AI agent 前端集成框架
- [Next.js](https://nextjs.org) - React 开发框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架

## 许可证

[MIT License](./LICENSE)
