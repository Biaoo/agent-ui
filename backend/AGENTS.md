# AGENTS.md

## Quick Start

### Setup commands

```bash
# Create virtual environment
uv venv --python 3.12

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install -e .

# Configure environment variables
cp .env.example .env
# Edit .env and add your API keys

# Run tests
python -m pytest tests/ -v

# Start production server (no auto-reload)
app
# Or use Python module
python -m src.server

# Start development server (with auto-reload)
app-dev
# Or with explicit parameter
app --reload

# Server will run on http://0.0.0.0:7777 by default
```

## Project Overview

Backend using Python 3.12 + Agno framework + FastAPI for AI Agent services.

**Current Status**: Development stage with AgentOS server and basic agent implementations.

## Project Structure

```
backend/
├── src/
│   ├── server.py            # FastAPI server with AgentOS
│   ├── agents/              # Agent implementations (folder-based)
│   │   ├── chat_agent/      # Chat agent module
│   │   ├── search_agent/    # Search agent module
│   │   ├── README.md        # Agents overview
│   │   └── AGENTS.md        # Agent development guide ⭐
│   ├── config/              # Configuration management
│   │   ├── base.py          # Base configuration
│   │   └── model_config.py  # Model configuration
│   ├── tools/               # Tool implementations (folder-based)
│   │   ├── tavily/          # Tavily search tool
│   │   ├── ask_user_question/  # HITL question tool
│   │   ├── README.md        # Tools overview
│   │   └── AGENTS.md        # Tool development guide ⭐
│   └── knowledge/           # Knowledge base (placeholder)
├── tests/                   # Test files
│   ├── test_chat_agent.py
│   └── test_search_agent.py
├── pyproject.toml          # Python project configuration
├── .env.example            # Environment variables template
└── AGENTS.md              # This file
```

## Tech Stack

- **Python 3.12**: Main programming language
- **uv**: Environment and package manager
- **Agno Framework**: AI Agent development framework
- **FastAPI**: Web framework (planned)
- **Tavily**: Web search tool integration
- **OpenAI/Qwen**: LLM models

## Dependencies

Current dependencies from `pyproject.toml`:

```python
dependencies = [
    "ag-ui-protocol>=0.1.10",
    "agno>=2.2.13",
    "fastapi>=0.121.2",
    "loguru>=0.7.3",
    "openai>=2.8.0",
    "python-dotenv>=1.2.1",
    "tavily-python>=0.7.13",
    "uvicorn>=0.38.0",
]
```

**Note**: When adding or updating dependencies, use `uv add <package>` instead of modifying `pyproject.toml` directly. This ensures proper dependency resolution.

```bash
# Add a new dependency
uv add <package-name>

# Add a development dependency
uv add --dev <package-name>

# Remove a dependency
uv remove <package-name>
```

## Code Style

### Python

- Python 3.12+ with type hints
- Follow PEP 8 style guide
- Use `uv` for package management
- Use `ruff` for linting (configured in pyproject.toml)
- Async/await for I/O operations
- Environment variables for configuration

### General

- Conventional commits for git messages
- Write tests for new features
- Use descriptive variable and function names

## Available Agents & Tools

**See detailed documentation**:

- **[Agents Overview](./src/agents/README.md)** - All available agents (ChatAgent, SearchAgent)
- **[Tools Overview](./src/tools/README.md)** - All available tools (Tavily, HITL tools)

**Quick usage example**:

```python
# Import and use any agent
from src.agents.chat_agent import chat_agent
from src.agents.search_agent import search_agent

# All agents follow the same interface
response = chat_agent.run("Your query here")
```

**Model Configuration** (`src/config/model_config.py`):

- `qwen_model_config` - For simple tasks (qwen-plus)
- `qwen_max_config` - For complex reasoning (qwen-max)

### AgentOS Server

The FastAPI server is created using AgentOS, which automatically manages multiple agents:

```python
from src.server import app, agent_os

# The server is already configured with:
# - Multiple agents (ChatAgent, SearchAgent)
# - AG-UI protocol support
# - Auto-reload in development mode
```

**How to run**:

```bash
# Production mode (no auto-reload)
app
# Or use Python module
python -m src.server

# Development mode (with auto-reload)
app-dev
# Or with explicit parameter
app --reload

# Server will start on http://0.0.0.0:7777
# Access the API docs at http://localhost:7777/docs
```

**File**: `src/server.py`

The server automatically exposes:

- REST API endpoints for agent interactions
- WebSocket support for streaming responses
- AG-UI protocol compatibility at `/*/agui` for each agent
- Swagger/OpenAPI documentation at `/docs`

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Required for Qwen models
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Required for Tavily search
TAVILY_API_KEY=your_tavily_api_key_here

# Optional: OpenAI models
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Server configuration
HOST=0.0.0.0
PORT=7777

# Development settings
DEBUG=true
LOG_LEVEL=INFO
```

## Testing

### Run all tests

```bash
python -m pytest tests/ -v
```

### Run specific test

```bash
python -m pytest tests/test_chat_agent.py -v
python -m pytest tests/test_search_agent.py -v
```

### Test patterns

- `test_chat_agent.py`: Tests for chat agent functionality
- `test_search_agent.py`: Tests for search agent with Tavily tool

## Development Workflow

### Adding a New Agent

**⭐ See detailed guide**: [`src/agents/AGENTS.md`](./src/agents/AGENTS.md)

Quick summary:

1. **Create folder structure**:

   ```bash
   cd src/agents
   mkdir -p your_agent
   touch your_agent/{__init__.py,agent.py,README.md}
   ```

2. **Follow folder-based architecture**:
   - `__init__.py` - Agent export layer
   - `agent.py` - Core agent configuration
   - `prompts.py` - Instructions (optional)
   - `README.md` - Documentation

3. **Choose appropriate model**:
   - `qwen-plus` (qwen_model_config) - Simple tasks
   - `qwen-max` (qwen_max_config) - Complex reasoning

4. **Add role mapping** (required for Qwen):

   ```python
   model.default_role_map = {
       "system": "system",
       "user": "user",
       "assistant": "assistant",
       "tool": "tool",
       "model": "assistant",
   }
   ```

5. **Register in server.py** and add tests

**Complete guide with examples**: See [`src/agents/AGENTS.md`](./src/agents/AGENTS.md)

### Adding a New Tool

**⭐ See detailed guide**: [`src/tools/AGENTS.md`](./src/tools/AGENTS.md)

Quick summary:

1. **Create folder structure**:

   ```bash
   cd src/tools
   mkdir -p your_tool
   touch your_tool/{__init__.py,core.py,README.md}
   ```

2. **Follow separation of concerns**:
   - `core.py` - Business logic (directly callable)
   - `__init__.py` - Tool wrapper with `@tool` decorator
   - `README.md` - Documentation

3. **Use complete type hints** and error handling

4. **Test core functions directly**, not via `.entrypoint`

**Complete guide with examples**: See [`src/tools/AGENTS.md`](./src/tools/AGENTS.md)

## Next Steps (Roadmap)

**Completed**:

- [x] FastAPI server implementation with AgentOS
- [x] AG-UI protocol integration
- [x] Basic chat and search agents

**Planned features**:

- [ ] Knowledge base management
- [ ] Agent persistence and state management
- [ ] API authentication and authorization
- [ ] Production deployment configuration
- [ ] More specialized agents (code analysis, data analysis, etc.)
- [ ] Agent memory and conversation history
- [ ] Custom tool marketplace

## Troubleshooting

### Common Issues

**1. Import errors**

```bash
# Make sure you're in the backend directory
cd /Users/biao/Code/agent-ui-project/backend

# Reinstall dependencies
uv pip install -e .
```

**2. API key errors**

```bash
# Check your .env file has required keys
cat .env | grep API_KEY
```

**3. Model initialization errors**

```python
# Verify model configuration
from src.config.model_config import qwen_model_config
print(qwen_model_config.to_dict())
```

## Development Guides

**Internal Documentation** (⭐ Detailed Standards):

- **[Agent Development Guide](./src/agents/AGENTS.md)** - Complete agent development standards
  - Folder-based structure
  - Model selection (qwen-plus vs qwen-max)
  - HITL patterns
  - Best practices and anti-patterns
- **[Tool Development Guide](./src/tools/AGENTS.md)** - Complete tool development standards
  - Separation of core logic and tool wrapper
  - Type hints and documentation
  - Testing patterns
  - HITL tool implementation
- **[Agents Overview](./src/agents/README.md)** - Overview of all available agents
- **[Tools Overview](./src/tools/README.md)** - Overview of all available tools

**External Resources**:

- [Agno Documentation](https://docs.agno.ai/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tavily API](https://tavily.com/)
- [AG-UI Protocol](https://github.com/agentstation/ag-ui-protocol)

## Notes

This is a simplified development guide focused on the current implementation. As the project evolves, this documentation will be updated to reflect new features and capabilities.
