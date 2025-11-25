# Search Agent

> A web search-enabled AI agent powered by Tavily search tool with Human-in-the-Loop capabilities.

## Features

- Real-time web search capabilities
- Source citation and link references
- Bilingual support (中文/English)
- Structured result summaries
- Human-in-the-Loop (HITL) interactions
- Event streaming for monitoring
- Intermediate step visibility

## Usage

### Basic Example

```python
from src.agents.search_agent import search_agent

# Search for current information
response = search_agent.run("What's the latest news about AI?")
print(response.content)
```

### With Streaming

```python
# Stream search results in real-time
for chunk in search_agent.run("Latest developments in quantum computing", stream=True):
    if hasattr(chunk, 'content'):
        print(chunk.content, end="", flush=True)
```

### Chinese Language Example

```python
# 中文搜索示例
response = search_agent.run("最新的人工智能新闻是什么？")
print(response.content)
```

## Configuration

- **Model**: qwen-max (better instruction following)
- **Tools**:
  - `tavily_tool` - Web search with source citations
  - `ask_user_question_tool` - Structured user questions (HITL)
- **Streaming**: Enabled
- **Event Storage**: Enabled
- **Markdown**: Enabled
- **HITL**: Enabled (interactive clarification)
- **Intermediate Steps**: Enabled (shows search process)

## Use Cases

- Latest news and current events
- Real-time information lookup
- Research and fact-checking
- Trend analysis
- Competitive intelligence
- Market research

## How It Works

1. **User Query**: User asks a question requiring current information
2. **Clarification (HITL)**: If query is ambiguous, agent asks for clarification
3. **Search Decision**: Agent decides whether to use Tavily search
4. **Web Search**: Tavily searches the web and returns relevant results
5. **Synthesis**: Agent analyzes and summarizes search results
6. **Response**: User receives answer with proper source citations

## Human-in-the-Loop (HITL)

The agent will ask clarifying questions when:

- **Ambiguous queries**: Generic terms like "AI", "technology"
- **Missing context**: No time frame specified
- **Multiple interpretations**: "Python" could mean programming, snake, etc.
- **Broad results**: Need to narrow focus area

### HITL Example

```python
# Ambiguous query - agent will ask for clarification
response = search_agent.run("Tell me about Apple")
# Agent may ask:
# - "What aspect of Apple would you like to know about?"
# - Options: Apple Inc., Apple fruit, Apple products
```

## Citation Format

The agent follows strict citation format rules:

### Inline Citations

```markdown
Content text[1](#ref:1), more content[2](#ref:2)
```

### Reference List

```markdown
1. [Source Title](#source:1:https://example.com)
2. [Another Source](#source:2:https://example2.com)
```

## Example Interactions

### News Query

```python
response = search_agent.run("What happened in tech today?")
# Agent will:
# 1. Use Tavily to search for latest tech news
# 2. Analyze multiple sources
# 3. Provide summary with citations
```

### Fact Checking

```python
response = search_agent.run("Is it true that Python 3.13 was released?")
# Agent will:
# 1. Search for Python 3.13 release information
# 2. Verify from official sources
# 3. Provide factual answer with links
```

## Limitations

- Search results depend on Tavily API availability
- May have rate limits based on Tavily subscription
- Results are as current as Tavily's index
- Cannot access paywalled or restricted content

## Architecture

```
search_agent/
├── __init__.py    # Agent export
├── agent.py       # Core configuration with tools
├── prompts.py     # Instructions management (HITL, citation rules)
└── README.md      # This file
```

## Prompt Structure

The agent uses modular prompt management in `prompts.py`:

- `SYSTEM_INSTRUCTIONS` - Agent role definition
- `HITL_STRATEGY` - When and how to use HITL tools
- `WHEN_TO_ASK` - Conditions for user clarification
- `HITL_EXAMPLES` - Usage examples
- `INTERACTION_FLOW` - Step-by-step workflow
- `CITATION_FORMAT_RULES` - Strict citation formatting
- `RESPONSE_TEMPLATE` - Standard response structure
- `CITATION_NOTES` - Important formatting notes

## Tool Details

### Tavily Search Tool

The agent uses the Tavily tool for web searches:

```python
from src.tools.tavily import tavily_tool

# Tool is configured with:
# - API key from environment
# - Optimized for news and general queries
# - Returns with source URLs
```

### Ask User Question Tool (HITL)

For structured clarification:

```python
from src.tools.ask_user_question import ask_user_question_tool

# Used when:
# - Query is ambiguous
# - Multiple valid options exist
# - Need to narrow down results
```

## Integration

This agent can be used as a secondary agent in AgentOS:

```python
# In server.py
from src.agents.search_agent import search_agent

agent_os = AgentOS(
    # ...
    additional_agents=[search_agent],
)
```

## Environment Variables

Required environment variables:

```bash
# Tavily API key
TAVILY_API_KEY=your_tavily_api_key_here

# Qwen model configuration
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

## See Also

- [Chat Agent](../chat_agent/README.md) - Basic conversational agent
- [Tavily Tool Documentation](../../tools/tavily/README.md)
- [Ask User Question Tool](../../tools/ask_user_question/README.md)
- [Agent Development Guide](../AGENTS.md)
