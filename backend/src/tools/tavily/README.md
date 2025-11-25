# Tavily

> Web search tool integration using Tavily API for advanced search capabilities.

## Features

- Advanced web search with configurable depth
- JSON and markdown output formats
- Configurable token limits for results
- Integration with Agno framework
- Environment variable configuration

## Installation

Dependencies required:

```bash
uv add tavily-python
```

## Usage

### Basic Example

```python
from src.tools.tavily import tavily_tool

# Use the pre-configured tool
agent = Agent(
    model=model,
    tools=[tavily_tool]
)
```

### Custom Configuration

```python
from src.tools.tavily import create_tavily_tool

# Create custom tool instance
custom_tool = create_tavily_tool(
    api_key="your-api-key",
    enable_search=True,
    max_tokens=8000,
    search_depth="advanced",
    format="json"
)

agent = Agent(
    model=model,
    tools=[custom_tool]
)
```

### With Agent

```python
from agno.agent import Agent
from src.tools.tavily import tavily_tool

agent = Agent(
    model=model,
    tools=[tavily_tool],
    instructions=["Use web search when you need current information"]
)

response = agent.run("What's the latest news about AI?")
```

## API Reference

### `create_tavily_tool(api_key=None, enable_search=True, max_tokens=8000, search_depth="advanced", format="json") -> TavilyTools`

Create and configure Tavily search tool instance.

**Parameters:**

- `api_key` (str, optional): Tavily API key. If not provided, reads from TAVILY_API_KEY env var
- `enable_search` (bool): Whether to enable search functionality. Default: True
- `max_tokens` (int): Maximum tokens for search results. Default: 8000
- `search_depth` (str): Search depth level ("basic" or "advanced"). Default: "advanced"
- `format` (str): Result format ("json" or "markdown"). Default: "json"

**Returns:**

- `TavilyTools`: Configured TavilyTools instance

**Raises:**

- `ValueError`: If API key is not provided and not found in environment

**Example:**

```python
tool = create_tavily_tool()
# Or with custom settings
tool = create_tavily_tool(
    max_tokens=5000,
    search_depth="basic"
)
```

## Configuration

Environment variables:

```bash
# .env
TAVILY_API_KEY=your_tavily_api_key_here
```

## Examples

### Example 1: Basic Web Search

```python
from agno.agent import Agent
from src.tools.tavily import tavily_tool
from src.config.model_config import qwen_model_config

agent = Agent(
    model=qwen_model_config.get_model(),
    tools=[tavily_tool],
    instructions=["Use web search when needed"]
)

response = agent.run("What are the latest developments in AI?")
print(response.content)
```

### Example 2: Custom Search Configuration

```python
from src.tools.tavily import create_tavily_tool

# Create tool with custom settings
search_tool = create_tavily_tool(
    max_tokens=5000,
    search_depth="basic",
    format="markdown"
)

agent = Agent(
    model=model,
    tools=[search_tool]
)
```

## Error Handling

Common errors and solutions:

### Missing API Key

**Problem**: `ValueError: Tavily API key is required`

**Solution**: Set the TAVILY_API_KEY environment variable in your `.env` file:
```bash
TAVILY_API_KEY=your_api_key_here
```

### Rate Limiting

**Problem**: API rate limit exceeded

**Solution**: Reduce request frequency or upgrade your Tavily plan

## Performance

- Default `max_tokens=8000` balances detail and speed
- Use `search_depth="basic"` for faster results
- Use `search_depth="advanced"` for more comprehensive results

## Troubleshooting

### Empty Search Results

**Symptoms**: Tool returns no results

**Cause**: Query too specific or API connectivity issues

**Fix**:
- Broaden your search query
- Check internet connectivity
- Verify API key is valid

## Architecture

```
tavily/
├── __init__.py      # Tool export and default instance
├── core.py          # Core implementation (create_tavily_tool)
└── README.md        # This documentation
```

The tool wraps Agno's built-in TavilyTools with configuration management.

## Resources

- [Tavily API Documentation](https://docs.tavily.com/)
- [Agno Tools Documentation](https://docs.agno.ai/tools)
- [Tool Development Guide](../AGENTS.md)

## Changelog

### Version 0.1.0 (2025-11-19)

- Refactored to standard tool structure
- Added core.py with create_tavily_tool function
- Added comprehensive documentation
- Environment variable configuration

---

**Last Updated**: 2025-11-19
