# Agents Overview

> This directory contains all AI agents implemented for the project.

## Available Agents

### 1. Chat Agent

**Path**: `src/agents/chat_agent/`

**Type**: Simple Conversational Agent

**Model**: qwen-plus

**Description**: Basic conversational AI for general-purpose interactions.

**Features**:
- Friendly and professional responses
- Markdown formatting
- Event streaming
- Cost-effective

**Usage**:
```python
from src.agents.chat_agent import chat_agent

response = chat_agent.run("Hello!")
print(response.content)
```

**Documentation**: [chat_agent/README.md](./chat_agent/README.md)

---

### 2. Search Agent

**Path**: `src/agents/search_agent/`

**Type**: Tool-Enhanced Agent with Human-in-the-Loop

**Model**: qwen-max (better instruction following)

**Description**: Web search-enabled agent using Tavily for current information with HITL capabilities for query clarification.

**Features**:
- Real-time web search
- Source citations with strict format rules
- Bilingual support (中文/English)
- Structured result summaries
- Human-in-the-Loop (HITL) interactions

**Tools**:
- `tavily_tool` - Web search with citations
- `ask_user_question_tool` - Structured questions (HITL)

**Usage**:
```python
from src.agents.search_agent import search_agent

response = search_agent.run("What's the latest news about AI?")
print(response.content)
```

**Documentation**: [search_agent/README.md](./search_agent/README.md)

---

## Agent Architecture

All agents follow the standard structure defined in [AGENTS.md](./AGENTS.md):

```
agent_name/
├── __init__.py       # Agent export layer
├── agent.py          # Core configuration
├── prompts.py        # Instructions management (optional)
├── README.md         # Agent documentation
└── [other files]     # Additional utilities
```

## Quick Start

### Import an Agent

```python
# All agents use the same import pattern
from src.agents.chat_agent import chat_agent
from src.agents.search_agent import search_agent
```

### Basic Interaction

```python
# Run agent with a query
response = agent.run("Your query here")
print(response.content)
```

### Streaming Responses

```python
# Stream responses in real-time
for chunk in agent.run("Your query", stream=True):
    if hasattr(chunk, 'content'):
        print(chunk.content, end="", flush=True)
```

## Model Selection Guide

| Agent Type | Model | When to Use |
|------------|-------|-------------|
| **Chat Agent** | qwen-plus | Simple conversations, basic Q&A |
| **Search Agent** | qwen-max | Web search, current information, HITL |

### Model Comparison

| Feature | qwen-plus | qwen-max |
|---------|-----------|----------|
| Cost | Lower | Higher |
| Speed | Faster | Slower |
| Reasoning | Basic | Advanced |
| Chain-of-Thought | ❌ | ✅ |
| Use Case | Simple tasks | Complex tasks |

## Development Guide

For detailed agent development standards and best practices, see:

**[AGENTS.md](./AGENTS.md)** - Complete development guide including:
- Agent directory structure
- Development standards
- Tool integration
- Human-in-the-Loop patterns
- Testing guidelines
- Best practices

## Integration with Server

All agents are registered in `src/server.py`:

```python
from src.agents.chat_agent import chat_agent
from src.agents.search_agent import search_agent

# AgentOS automatically manages all agents
agent_os = AgentOS(
    name="MultiAgentSystem",
    agents=[chat_agent, search_agent],
    # ...
)
```

## Common Patterns

### 1. Simple Conversation (Chat Agent)

```python
from src.agents.chat_agent import chat_agent

response = chat_agent.run("Explain quantum computing")
```

### 2. Web Search (Search Agent)

```python
from src.agents.search_agent import search_agent

response = search_agent.run("Latest AI developments in 2025")
```

## Environment Variables

Required for all agents:

```bash
# Qwen models
DASHSCOPE_API_KEY=your_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

Additional for specific agents:

```bash
# Search Agent
TAVILY_API_KEY=your_tavily_key_here
```

## Testing

All agents can be imported and tested:

```bash
# Test imports
python -c "from src.agents.chat_agent import chat_agent; print('✓ Chat Agent')"
python -c "from src.agents.search_agent import search_agent; print('✓ Search Agent')"

# Run test scripts
python tests/test_chat_agent.py
python tests/test_search_agent.py
```

## Directory Structure

```
src/agents/
├── README.md                    # This file
├── AGENTS.md                    # Development guide
├── CLAUDE.md                    # Symlink to AGENTS.md
│
├── chat_agent/
│   ├── __init__.py
│   ├── agent.py
│   └── README.md
│
└── search_agent/
    ├── __init__.py
    ├── agent.py
    ├── prompts.py
    └── README.md
```

## Contributing

When creating a new agent:

1. **Plan**: Define purpose, tools, model, and HITL needs
2. **Create**: Follow the structure in [AGENTS.md](./AGENTS.md)
3. **Document**: Write comprehensive README.md
4. **Test**: Ensure imports and functionality work
5. **Integrate**: Register in `server.py` if needed

See [AGENTS.md](./AGENTS.md) for complete development workflow.

---

**Total Agents**: 2
**Last Updated**: 2025-11-25
**Architecture Version**: 1.0 (Folder-based structure)
