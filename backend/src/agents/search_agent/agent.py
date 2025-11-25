"""Search Agent core configuration.

This module provides a web search-enabled AI agent using the Qwen model
and Tavily search tool. The agent can search the web for current information
and provide answers with proper source citations.

Example:
    >>> from src.agents.search_agent import search_agent
    >>> response = search_agent.run("What's the latest news about AI?")
    >>> print(response.content)

Tools Used:
    - tavily_tool: Web search with source citations
    - ask_user_question_tool: Structured user questions (HITL)

Configuration:
    - Model: qwen-max (better instruction following)
    - Streaming: Enabled
    - Event storage: Enabled
    - HITL: Enabled (interactive clarification)
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.utils.log import agent_logger

from ...config.model_config import qwen_max_config
from ...tools.tavily import tavily_tool
from ...tools.ask_user_question import ask_user_question_tool
from .prompts import FULL_INSTRUCTIONS

# Initialize model - using qwen-max for better instruction following
model = OpenAIChat(
    id=qwen_max_config.model_name,
    api_key=qwen_max_config.api_key,
    base_url=qwen_max_config.base_url,
)

# Fix role mapping for Qwen API
model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

# Create search agent with HITL capabilities
search_agent = Agent(
    name="SearchAgent",
    model=model,
    tools=[tavily_tool, ask_user_question_tool],
    instructions=FULL_INSTRUCTIONS,
    markdown=True,
    stream_events=True,
    store_events=True,
    events_to_skip=[],
    stream_intermediate_steps=True,
)
