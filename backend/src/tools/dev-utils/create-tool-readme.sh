#!/bin/bash
# Create a README.md template for a new Agno tool
# Usage: ./create-tool-readme.sh <tool_name> [output_path]

set -e

TOOL_NAME="$1"
OUTPUT_PATH="${2:-./README.md}"

if [ -z "$TOOL_NAME" ]; then
    echo "Usage: $0 <tool_name> [output_path]"
    echo "Example: $0 my_awesome_tool ./my_awesome_tool/README.md"
    exit 1
fi

# Convert tool_name to TitleCase for display
TOOL_DISPLAY=$(echo "$TOOL_NAME" | sed -e 's/_/ /g' -e 's/\b\(.\)/\u\1/g')

cat > "$OUTPUT_PATH" << 'EOF'
# {{TOOL_DISPLAY}}

> Brief description of what the tool does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

Dependencies required (if any).

```bash
# Example
uv add package-name
```

## Usage

### Basic Example

```python
from src.tools.{{TOOL_NAME}} import {{TOOL_NAME}}_impl

result = {{TOOL_NAME}}_impl("input")
print(result)
```

### With Agent

```python
from agno.agent import Agent
from src.tools.{{TOOL_NAME}} import {{TOOL_NAME}}_tool

agent = Agent(
    model=model,
    tools=[{{TOOL_NAME}}_tool],
    instructions=["Use {{TOOL_NAME}} when needed"]
)

response = agent.run("Your task here")
```

## API Reference

### `{{TOOL_NAME}}_impl(param: str) -> str`

Core implementation function.

**Parameters:**

- `param` (str): Description of param

**Returns:**

- `str`: Description of return value

**Raises:**

- `ValueError`: When validation fails

**Example:**

```python
result = {{TOOL_NAME}}_impl("example")
```

## Configuration

Environment variables (if any):

```bash
# .env
TOOL_CONFIG_KEY=value
```

## Examples

### Example 1: Basic Usage

```python
from src.tools.{{TOOL_NAME}} import {{TOOL_NAME}}_impl

result = {{TOOL_NAME}}_impl("input")
print(result)
```

### Example 2: Advanced Usage

```python
# Add more complex examples here
```

## Testing

Run tests:

```bash
python -m pytest tests/test_{{TOOL_NAME}}.py -v
```

Run with coverage:

```bash
python -m pytest tests/test_{{TOOL_NAME}}.py --cov=src.tools.{{TOOL_NAME}} --cov-report=html
```

## Error Handling

Common errors and solutions:

### Error 1

**Problem**: Description of the error

**Solution**: How to fix it

### Error 2

**Problem**: Another error

**Solution**: Fix instructions

## Performance

Performance considerations and optimization tips.

## Troubleshooting

### Issue 1

**Symptoms**: What you see

**Cause**: Why it happens

**Fix**: How to resolve

## Architecture

High-level overview of the tool's architecture:

```
{{TOOL_NAME}}/
├── __init__.py      # Tool wrapper with @tool decorator
├── core.py          # Core implementation
└── helpers.py       # Helper functions (if needed)
```

## Development

### Adding New Features

1. Update core logic in `core.py`
2. Add tests in `tests/test_{{TOOL_NAME}}.py`
3. Update this README
4. Update tool wrapper in `__init__.py` if needed

### Code Style

- Follow PEP 8
- Use type hints
- Add docstrings (Google style)
- Write tests for new features

## Resources

- [Agno Tools Documentation](https://docs.agno.ai/tools)
- [Tool Development Guide](../AGENTS.md)
- Related documentation links

## Contributing

Guidelines for contributing to this tool.

## Changelog

### Version 0.1.0 (YYYY-MM-DD)

- Initial implementation
- Basic features

## License

Part of the agent-ui-project. See project LICENSE for details.

---

**Maintainer**: Your Name
**Last Updated**: YYYY-MM-DD
EOF

# Replace placeholders
sed -i '' "s/{{TOOL_NAME}}/$TOOL_NAME/g" "$OUTPUT_PATH"
sed -i '' "s/{{TOOL_DISPLAY}}/$TOOL_DISPLAY/g" "$OUTPUT_PATH"

echo "✅ README template created at: $OUTPUT_PATH"
echo ""
echo "Next steps:"
echo "1. Edit $OUTPUT_PATH and fill in the details"
echo "2. Remove sections you don't need"
echo "3. Add tool-specific content"
