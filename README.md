# Agent UI Demo

A demonstration project for AI Agent user interfaces based on the [AG-UI Protocol](https://docs.ag-ui.com).

**English** | [中文](./README.zh.md)

## Why This Project

While developing AI Agent applications, I gradually realized an overlooked problem: **Although the event stream returned by an Agent is in text form, it contains multiple types of content—thinking processes, tool calls, intermediate results, and final responses. How should the frontend elegantly present this information?**

Traditional chat interfaces are clearly insufficient. Users need to see the Agent's "thinking process," make decisions at critical points (Human-in-the-Loop), and understand the inputs and outputs of tool calls. I realized that this might require an entirely new **communication protocol between Agent and UI**.

With this question in mind, I began researching industry solutions. [CopilotKit](https://copilotkit.ai) provides an excellent frontend integration paradigm, while [AG-UI Protocol](https://docs.ag-ui.com) defines a standardized communication protocol between Agents and UIs. This project is an exploration and practice based on these frameworks, aiming to validate various Agent UI interaction patterns.

## Implemented Agent UI Features

1. **Tool Calling UI Components** - Using search tool as example, demonstrating Agent tool invocation UI flow
2. **Human-in-the-Loop Components** - `AskUserQuestion` component for Agent to pause and ask user questions
3. **Tool Details Two-Column Layout** - Split view with conversation on left, tool call details on right
4. **Custom Markdown Styling** - Enhanced display of citation sources in search results

## Demo

https://github.com/user-attachments/assets/f479516c-9d92-4a3e-8dad-b82e2677d4b3

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- uv (Python package manager)

### Installation & Running

```bash
# Clone repository
git clone https://github.com/Biaoo/agent-ui.git
cd agent-ui

# One-click setup
./scripts/setup.sh

# Start development servers
./start-dev.sh
```

Or manual installation:

```bash
# Backend
cd backend
uv venv --python 3.12
source .venv/bin/activate
uv pip install -e .
cp .env.example .env  # Edit to add API keys

# Frontend
cd frontend
npm install
```

Start services:

```bash
# Backend (Terminal 1)
cd backend && source .venv/bin/activate && app-dev

# Frontend (Terminal 2)
cd frontend && npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

Configure in `backend/.env`:

```env
# Required: DashScope (Qwen model)
DASHSCOPE_API_KEY=your_key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Optional: Tavily search tool
TAVILY_API_KEY=your_key
```

> To use other models (e.g., OpenAI), modify `backend/src/config/model_config.py`

## Project Structure

```
agent-ui-project/
├── backend/                 # Python backend (Agno + FastAPI)
│   ├── src/
│   │   ├── agents/         # Agent implementations (Chat, Search)
│   │   ├── tools/          # Tool implementations (Tavily, HITL)
│   │   └── server.py       # AgentOS server
│   └── AGENTS.md           # Backend development guide
├── frontend/                # TypeScript frontend (Next.js + CopilotKit)
│   ├── app/
│   │   ├── components/     # React components
│   │   ├── pages/          # Pages (Chat, Search)
│   │   └── api/copilotkit/ # CopilotKit runtime
│   └── AGENTS.md           # Frontend development guide
├── docs/                    # Project documentation
│   ├── MULTI_AGENT_SETUP.md
│   └── implementation/     # Implementation records
└── AGENTS.md               # Overall development guide
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend Framework | [Agno](https://docs.agno.com) + FastAPI |
| Frontend Framework | Next.js 16 + React 19 |
| Agent Communication | [AG-UI Protocol](https://docs.ag-ui.com) |
| Frontend Integration | [CopilotKit](https://copilotkit.ai) |
| Styling | Tailwind CSS 4 |
| LLM | Qwen (DashScope) / OpenAI |

## Documentation

- [AGENTS.md](./AGENTS.md) - Project development guide
- [Backend Development](./backend/AGENTS.md) - Agent and tool development
- [Frontend Development](./frontend/AGENTS.md) - Component and page development

## Acknowledgments

- [Agno](https://docs.agno.com) - AI Agent development framework
- [AG-UI Protocol](https://docs.ag-ui.com) - Agent-UI communication protocol
- [CopilotKit](https://copilotkit.ai) - AI agent frontend integration framework

## License

[MIT License](./LICENSE)
