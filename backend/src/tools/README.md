# Agno Tools

This directory contains custom tools for Agno agents.

> 📖 **Development Guide**: See [AGENTS.md](./AGENTS.md) or [CLAUDE.md](./CLAUDE.md) for complete tool development standards and best practices.

## Available Tools

### 1. Tavily Search Tool

Web search integration using the Tavily API.

**File**: `tavily.py`

**Usage**:
```python
from src.tools.tavily import tavily_tool

agent = Agent(tools=[tavily_tool])
```

### 2. AskUserQuestion Tool

Human-in-the-Loop tool for gathering user input through interactive questions.

**Directory**: `ask_user_question/`

**Features**:
- Single and multiple choice questions
- 1-4 questions per call
- 2-4 options per question
- Rich validation and error handling
- Full type safety with Python type hints

**Quick Start**:
```python
from src.tools.ask_user_question import (
    ask_user_question_tool,
    ask_user_question_impl,
    create_question
)
import json

# Use in agent
agent = Agent(
    model=model,
    tools=[ask_user_question_tool],  # Tool wrapper for agent
    instructions=["Use ask_user_question to gather user preferences"]
)

# Or call core function directly (e.g., in tests)
questions = [create_question(...)]
result = ask_user_question_impl(
    questions_json=json.dumps(questions)
)
```

**Documentation**:
- Full docs: [ask_user_question/README.md](./ask_user_question/README.md)
- Example: [ask_user_question/example.py](./ask_user_question/example.py)
- Tests: [tests/test_ask_user_question.py](../../tests/test_ask_user_question.py)

**Testing**:
```bash
python -m pytest tests/test_ask_user_question.py -v
```

## Creating Custom Tools

> 📖 **Full Development Guide**: See [AGENTS.md](./AGENTS.md) for detailed tool development standards and best practices.

Also see: [Creating your own tools](../../../docs/guides/agno-develop/Creating%20your%20own%20tools.md) guide.

### Basic Pattern

```python
from agno.tools import tool

@tool(
    name="my_custom_tool",
    description="What the tool does"
)
def my_custom_tool(param: str) -> str:
    """
    Tool docstring.

    Args:
        param: Description

    Returns:
        Result description
    """
    # Implementation
    return result
```

### Human-in-the-Loop Tools

For tools requiring user input:

```python
@tool(
    requires_user_input=True,
    user_input_fields=["field_name"]
)
def my_interactive_tool(field_name: str) -> str:
    """Tool that requires user input."""
    return f"Processed: {field_name}"
```

See [Human-in-the-Loop](../../../docs/guides/agno-develop/Human-in-the-loop.md) guide for more patterns.

## Tool Development Checklist

When creating a new tool:

- [ ] Create tool file in `src/tools/`
- [ ] Add `@tool` decorator with proper parameters
- [ ] Write comprehensive docstrings
- [ ] Add type hints for all parameters
- [ ] Implement error handling
- [ ] Create tests in `tests/`
- [ ] Add usage examples in `examples/`
- [ ] Update this README
- [ ] Update project documentation

## Resources

- [Agno Tools Documentation](https://docs.agno.com/concepts/tools)
- [Human-in-the-Loop Guide](../../../docs/guides/agno-develop/Human-in-the-loop.md)
- [AG-UI Protocol](../../../docs/AG-UI%20Interface.md)
