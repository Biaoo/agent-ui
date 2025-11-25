"""
AskUserQuestion Tool - Human-in-the-Loop interactive question tool for Agno agents.

This module provides the tool wrapper and exports the main functions.
"""

from typing import Optional
from agno.tools import tool

from .core import ask_user_question, create_question, QuestionOption, Question

# Export core components for direct use
__all__ = [
    "ask_user_question_tool",
    "ask_user_question",
    "create_question",
    "QuestionOption",
    "Question",
]


@tool(
    name="ask_user_question",
    description=(
        "Ask the user one or more questions during task execution to gather preferences, "
        "clarify ambiguous instructions, or get decisions on implementation choices. "
        "Supports single-choice and multiple-choice questions with 2-4 options each. "
        "Users can always provide custom input via an automatic 'Other' option."
    ),
    instructions="""
CRITICAL: When using this tool, you MUST provide questions_json in the EXACT format below.

REQUIRED JSON FORMAT:
```json
[
  {
    "question": "The question text to ask the user",
    "header": "ShortLabel",
    "options": [
      {"label": "Option 1", "description": "Description of option 1"},
      {"label": "Option 2", "description": "Description of option 2"}
    ],
    "multiSelect": false
  }
]
```

REQUIRED FIELDS (ALL MUST be present):
- question (string): The question text
- header (string): Short label (MAX 12 characters)
- options (array): 2-4 option objects, each with:
  - label (string): The option label/name
  - description (string): Explanation of this option
- multiSelect (boolean): true for multiple choice, false for single choice

EXAMPLES:

Example 1 - Material Type Selection:
```json
[
  {
    "question": "Which type of steel data do you need?",
    "header": "Steel Type",
    "options": [
      {"label": "Production", "description": "Primary steel production data"},
      {"label": "Market", "description": "Steel market average data"},
      {"label": "Alloy", "description": "Specific steel alloy"}
    ],
    "multiSelect": false
  }
]
```

Example 2 - Multiple Questions:
```json
[
  {
    "question": "Which region's data do you need?",
    "header": "Region",
    "options": [
      {"label": "CN", "description": "China regional data"},
      {"label": "GLO", "description": "Global average"},
      {"label": "RoW", "description": "Rest of World"}
    ],
    "multiSelect": false
  },
  {
    "question": "Select data sources (can choose multiple):",
    "header": "Sources",
    "options": [
      {"label": "Database A", "description": "Primary database"},
      {"label": "Ecoinvent", "description": "International database"}
    ],
    "multiSelect": true
  }
]
```

COMMON MISTAKES TO AVOID:
- ❌ Missing "header" field
- ❌ Missing "multiSelect" field
- ❌ Options as simple strings instead of {label, description} objects
- ❌ Header longer than 12 characters
- ❌ Less than 2 or more than 4 options
- ❌ Missing "description" in options

CORRECT USAGE:
✅ All fields present
✅ Options as objects with label and description
✅ Header ≤ 12 chars
✅ 2-4 options per question
✅ multiSelect as boolean (true/false)
    """,
    requires_user_input=True,
    user_input_fields=["user_answers"],
)
def ask_user_question_tool(
    questions_json: str, user_answers: Optional[str] = None
) -> str:
    """
    Ask the user interactive questions with single or multiple choice options.

    This is the tool wrapper that delegates to the core implementation.
    Agents will call this tool, which will pause execution for user input.

    Args:
        questions_json: JSON string containing a list of question objects
        user_answers: JSON string containing user's answers (populated by HITL)

    Returns:
        JSON string with answers or awaiting_user_input status

    Usage Notes:
        - Use this when you need user input to make decisions during task execution
        - Questions should be clear and specific
        - Options should be mutually exclusive (unless multiSelect is true)
        - Headers should be concise (max 12 characters)
        - Users always get an automatic "Other" option for custom input

    Example (from agent perspective):
        ```python
        # The agent will call this tool when it needs user input
        result = ask_user_question_tool(
            questions_json=json.dumps([{
                "question": "Which CSS framework should we use?",
                "header": "Styling",
                "multiSelect": False,
                "options": [
                    {"label": "Tailwind", "description": "Utility-first approach"},
                    {"label": "Material-UI", "description": "Component library"}
                ]
            }])
        )
        ```
    """
    return ask_user_question(questions_json=questions_json, user_answers=user_answers)
