"""
User Control Flow Tools for dynamic user input collection.

This module implements the "Dynamic User Input" pattern from Agno's
Human-in-the-Loop documentation, allowing agents to collect user feedback
when needed during execution.

Reference: https://docs.agno.com/concepts/hitl/overview
"""

import json
from typing import Optional

from agno.tools import tool


# Create the tool function with @tool decorator
@tool(
    name="collect_user_feedback",
    description="Collect dynamic user feedback during task execution. Use this when you need open-ended user input or specific details that are not predefined options.",
    requires_user_input=True,
    user_input_fields=["feedback"],
)
def collect_user_feedback_tool(prompt: str, feedback: Optional[str] = None) -> str:
    """
    Collect feedback from the user when needed.

    The agent can call this tool to ask questions dynamically during execution.
    This implements the Dynamic User Input pattern, allowing the agent to decide
    when and what to ask the user.

    Args:
        prompt (str): The question or prompt to show to the user.
            This should clearly explain what information you need.
        feedback (Optional[str]): The user's feedback response.
            This will be None initially and populated by the user.

    Returns:
        str: JSON response containing the status and user feedback.
            - If awaiting input: {"status": "awaiting_input", "prompt": "..."}
            - If completed: {"status": "completed", "feedback": "..."}

    Example:
        The agent might call:
        ```
        collect_user_feedback(
            prompt="What email address should I use for the notification?"
        )
        ```

        The user provides feedback through the HITL flow, and the agent
        receives the response to continue execution.
    """
    if feedback is None:
        # Waiting for user input
        return json.dumps(
            {
                "status": "awaiting_input",
                "prompt": prompt,
                "message": "Pausing execution to collect user feedback",
            }
        )

    # User has provided feedback
    return json.dumps(
        {
            "status": "completed",
            "feedback": feedback,
            "message": f"User provided feedback: {feedback}",
        }
    )
