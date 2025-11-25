# AskUserQuestion Tool

> A Human-in-the-Loop tool for Agno agents to gather user input through interactive questions.

## Overview

The `AskUserQuestion` tool enables Agno agents to pause execution and ask users single-choice or multiple-choice questions. This is useful for:

- Gathering user preferences during task execution
- Clarifying ambiguous instructions
- Getting decisions on implementation choices
- Offering multiple approaches to the user

This tool is inspired by Claude Code's `AskUserQuestion` functionality and implements Agno's Human-in-the-Loop patterns.

## Features

- **Single and Multiple Choice**: Support for both single-selection and multi-selection questions
- **Flexible Options**: 2-4 options per question with labels and descriptions
- **Batch Questions**: Ask 1-4 questions at once
- **Auto "Other" Option**: Users can always provide custom text input (handled by the frontend)
- **Type Safety**: Strongly typed with Python type hints
- **Error Handling**: Comprehensive validation and error messages
- **Rich Documentation**: Detailed docstrings and examples

## Installation

The tool is already integrated into the project. No additional dependencies required.

## Basic Usage

### 1. Import the Tool

```python
from src.tools.ask_user_question import ask_user_question, create_question
```

### 2. Add to Agent

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat

agent = Agent(
    name="DecisionAgent",
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[ask_user_question],
    instructions=[
        "When you need user input, use the ask_user_question tool."
    ]
)
```

### 3. Create Questions

Use the `create_question` helper function:

```python
import json

questions = [
    create_question(
        question="Which framework should we use?",
        header="Framework",
        options=[
            {"label": "React", "description": "Popular UI library"},
            {"label": "Vue", "description": "Progressive framework"}
        ],
        multi_select=False
    )
]

questions_json = json.dumps(questions)
```

### 4. Handle User Input Flow

```python
# Initial call - tool pauses for user input
run_response = agent.run("Help me choose a framework")

if run_response.is_paused:
    for tool in run_response.tools_requiring_user_input:
        # Get user input fields
        input_schema = tool.user_input_schema

        for field in input_schema:
            if field.value is None:
                # Display field to user and get input
                user_value = input(f"{field.description}: ")
                field.value = user_value

    # Continue execution with user input
    run_response = agent.continue_run(run_response=run_response)
```

## API Reference

### `ask_user_question`

Main tool function decorated with `@tool`.

**Parameters:**

- `questions_json` (str): JSON string containing list of question objects
- `user_answers` (str, optional): JSON string with user's answers

**Returns:**

JSON string with structure:

```json
{
  "answers": {
    "Framework": ["React"],
    "Features": ["Dark mode", "Analytics"]
  },
  "questions_asked": 2,
  "status": "completed"
}
```

### `create_question`

Helper function to create question dictionaries.

**Parameters:**

- `question` (str): The question text (should end with '?')
- `header` (str): Short label (max 12 chars)
- `options` (List[Dict]): 2-4 option objects with 'label' and 'description'
- `multi_select` (bool): Whether to allow multiple selections

**Returns:**

Dictionary representing a question.

## Question Format

### Single Question Structure

```json
{
  "question": "Which authentication method should we use?",
  "header": "Auth method",
  "multiSelect": false,
  "options": [
    {
      "label": "JWT",
      "description": "JSON Web Tokens - stateless, good for APIs"
    },
    {
      "label": "OAuth 2.0",
      "description": "Industry standard, supports third-party login"
    },
    {
      "label": "Session",
      "description": "Traditional cookies, simpler but requires server state"
    }
  ]
}
```

### User Answers Format

```json
{
  "question_0": ["JWT"],
  "question_1": ["Dark mode", "Analytics"]
}
```

## Examples

### Example 1: Single Choice Question

```python
import json
from src.tools.ask_user_question import ask_user_question, create_question

# Create a single-choice question
questions = [
    create_question(
        question="Which CSS framework should we use?",
        header="Styling",
        options=[
            {"label": "Tailwind CSS", "description": "Utility-first approach"},
            {"label": "Material-UI", "description": "Component library with Material Design"},
            {"label": "Bootstrap", "description": "Popular responsive framework"}
        ],
        multi_select=False
    )
]

# Call the tool (initial - awaits user input)
result = ask_user_question.entrypoint(questions_json=json.dumps(questions))
result_data = json.loads(result)

# User provides answer
user_answers = json.dumps({"question_0": ["Tailwind CSS"]})

# Call with user answers
final_result = ask_user_question.entrypoint(
    questions_json=json.dumps(questions),
    user_answers=user_answers
)
print(json.loads(final_result))
# Output: {"answers": {"Styling": ["Tailwind CSS"]}, "questions_asked": 1, "status": "completed"}
```

### Example 2: Multiple Choice Question

```python
questions = [
    create_question(
        question="Which features do you want to enable?",
        header="Features",
        options=[
            {"label": "Dark mode", "description": "Toggle between light and dark themes"},
            {"label": "Analytics", "description": "Track user behavior and metrics"},
            {"label": "i18n", "description": "Internationalization support"},
            {"label": "PWA", "description": "Progressive Web App features"}
        ],
        multi_select=True  # Allow multiple selections
    )
]

# User can select multiple options
user_answers = json.dumps({"question_0": ["Dark mode", "Analytics", "PWA"]})

final_result = ask_user_question.entrypoint(
    questions_json=json.dumps(questions),
    user_answers=user_answers
)
```

### Example 3: Multiple Questions

```python
questions = [
    create_question(
        question="Which framework?",
        header="Framework",
        options=[
            {"label": "React", "description": "UI library"},
            {"label": "Vue", "description": "Progressive framework"}
        ]
    ),
    create_question(
        question="Which state management?",
        header="State mgmt",
        options=[
            {"label": "Redux", "description": "Predictable state container"},
            {"label": "Zustand", "description": "Lightweight alternative"}
        ]
    )
]

user_answers = json.dumps({
    "question_0": ["React"],
    "question_1": ["Zustand"]
})

final_result = ask_user_question.entrypoint(
    questions_json=json.dumps(questions),
    user_answers=user_answers
)
```

### Example 4: With Agent Integration

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from src.tools.ask_user_question import ask_user_question

agent = Agent(
    name="SetupAssistant",
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[ask_user_question],
    instructions=[
        "Help users set up their projects.",
        "Ask about their technology preferences using ask_user_question."
    ]
)

# Agent will call ask_user_question during execution
run_response = agent.run("Help me set up a new web project")

# Handle the paused state
if run_response.is_paused:
    for tool in run_response.tools_requiring_user_input:
        # Process user input...
        pass
    run_response = agent.continue_run(run_response=run_response)
```

## Validation Rules

### Header Validation

- **Max length**: 12 characters
- **Recommendation**: Use short, descriptive labels like "Framework", "Auth", "Styling"

### Questions Validation

- **Count**: 1-4 questions per call
- **Format**: Should end with '?'
- **Clarity**: Should be specific and unambiguous

### Options Validation

- **Count**: 2-4 options per question
- **Label**: 1-5 words, concise and clear
- **Description**: Explain what choosing this option means
- **Mutually Exclusive**: Options should be distinct (unless multi_select=True)

## Error Handling

The tool provides comprehensive error handling:

### Invalid JSON

```python
result = ask_user_question.entrypoint(questions_json="invalid json")
# Returns: {"error": "Invalid questions_json format: ...", "status": "failed"}
```

### Too Many Questions

```python
# Asking 5 questions (max is 4)
result = ask_user_question.entrypoint(questions_json=json.dumps([...]))
# Returns: {"error": "Must ask 1-4 questions, got 5", "status": "failed"}
```

### Missing Required Fields

```python
questions = [{"question": "Test?"}]  # Missing header, options, multiSelect
result = ask_user_question.entrypoint(questions_json=json.dumps(questions))
# Returns: {"error": "Question 0 missing required fields", "status": "failed"}
```

## Best Practices

1. **Clear Questions**: Write specific, unambiguous questions
2. **Concise Options**: Keep labels short (1-5 words)
3. **Helpful Descriptions**: Explain trade-offs and implications
4. **Appropriate Multi-Select**: Use multi_select=True only when choices aren't mutually exclusive
5. **Header Length**: Stay within 12 characters for better UI display
6. **Error Handling**: Always check the status field in responses

## Integration with Frontend

The tool is designed to work with AG-UI protocol and CopilotKit. The frontend should:

1. Detect when the tool pauses for user input
2. Display questions with their options
3. Collect user selections
4. Provide an automatic "Other" option for custom input
5. Send answers back in the expected format

## Testing

Run the comprehensive test suite:

```bash
cd backend
python -m pytest tests/test_ask_user_question.py -v
```

Run example code:

```bash
cd backend
python examples/ask_user_question_example.py
```

## Architecture

```
AskUserQuestion Tool
├── ask_user_question (main tool function)
│   ├── @tool decorator with requires_user_input=True
│   ├── questions_json parameter
│   └── user_answers parameter (populated by HITL flow)
├── QuestionOption (data class)
│   ├── label: str
│   └── description: str
├── Question (data class)
│   ├── question: str
│   ├── header: str
│   ├── options: List[QuestionOption]
│   └── multi_select: bool
└── create_question (helper function)
```

## Comparison with Claude Code

This implementation mirrors Claude Code's `AskUserQuestion` tool with the following adaptations:

| Feature | Claude Code | Agno Implementation |
|---------|-------------|---------------------|
| Question Format | Native tool format | JSON-based with Agno decorators |
| Multi-select | ✅ Supported | ✅ Supported |
| Auto "Other" | ✅ Automatic | ✅ Frontend responsibility |
| Validation | Built-in | Comprehensive with Python types |
| Error Handling | System-level | Tool-level with detailed messages |
| Integration | Direct CLI | AG-UI protocol + CopilotKit |

## Troubleshooting

### Tool not pausing

**Issue**: The agent doesn't pause when calling ask_user_question

**Solution**: Ensure the tool is decorated with `@tool(requires_user_input=True)`

### User answers not being received

**Issue**: Answers provided but not processed

**Solution**: Check that answers use the correct format: `{"question_0": ["answer"], ...}`

### Validation errors

**Issue**: Questions or options validation failing

**Solution**: Review validation rules - check header length, option count, required fields

## Further Reading

- [Agno Human-in-the-Loop Documentation](./Human-in-the-loop.md)
- [Creating Custom Tools in Agno](./Creating%20your%20own%20tools.md)
- [AG-UI Protocol Specification](../AG-UI%20Interface.md)

## Contributing

To improve the AskUserQuestion tool:

1. Add new features in `backend/src/tools/ask_user_question.py`
2. Add corresponding tests in `backend/tests/test_ask_user_question.py`
3. Update documentation in this file
4. Run tests: `pytest tests/test_ask_user_question.py -v`

## License

Part of the agent-ui-project. See project LICENSE for details.
