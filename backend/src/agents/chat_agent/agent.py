"""Chat Agent core configuration.

This module provides a simple conversational AI agent using the Qwen model.
The agent is designed for basic chat interactions and general assistance.

Example:
    >>> from src.agents.chat_agent import chat_agent
    >>> response = chat_agent.run("Hello! How are you?")
    >>> print(response.content)

Configuration:
    - Model: qwen-plus (cost-effective for simple conversations)
    - Streaming: Enabled
    - Event storage: Enabled
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ...config.model_config import qwen_model_config

# Initialize model
model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)

# Fix role mapping for Qwen API
model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

# Create agent instance
chat_agent = Agent(
    name="ChatAgent",
    model=model,
    instructions="You are a helpful AI assistant. Respond in a friendly and professional manner.",
    markdown=True,
    stream_events=True,
    store_events=True,
    events_to_skip=[],
)
