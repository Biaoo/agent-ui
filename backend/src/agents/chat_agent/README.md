# Chat Agent

> A simple conversational AI agent for general-purpose interactions.

## Features

- Basic conversational capabilities
- Friendly and professional responses
- Markdown formatting support
- Event streaming for real-time interactions
- Cost-effective using qwen-plus model

## Usage

### Basic Example

```python
from src.agents.chat_agent import chat_agent

# Simple conversation
response = chat_agent.run("Hello! How are you?")
print(response.content)
```

### With Streaming

```python
# Stream responses in real-time
for chunk in chat_agent.run("Tell me a story", stream=True):
    if hasattr(chunk, 'content'):
        print(chunk.content, end="", flush=True)
```

### Multi-turn Conversation

```python
# The agent maintains conversation context
response1 = chat_agent.run("My name is Alice")
response2 = chat_agent.run("What's my name?")
print(response2.content)  # Should remember "Alice"
```

## Configuration

- **Model**: qwen-plus (Alibaba Qwen)
- **Tools**: None (pure conversation)
- **Streaming**: Enabled
- **Event Storage**: Enabled
- **Markdown**: Enabled

## Use Cases

- General Q&A
- Casual conversation
- Information assistance
- Learning and education
- Customer support baseline

## Limitations

- No external tool access (web search, calculations, etc.)
- Basic reasoning capabilities (use qwen-max for complex tasks)
- No domain-specific expertise (consider specialized agents)

## Architecture

```
chat_agent/
├── __init__.py    # Agent export
├── agent.py       # Core configuration
└── README.md      # This file
```

## Integration

This agent is automatically registered in the AgentOS server:

```python
# In server.py
from src.agents.chat_agent import chat_agent

agent_os = AgentOS(
    name="ChatBot",
    agent=chat_agent,  # Primary agent
    # ...
)
```

## See Also

- [Search Agent](../search_agent/README.md) - Agent with web search capability
- [Agent Development Guide](../AGENTS.md) - Standards and best practices
