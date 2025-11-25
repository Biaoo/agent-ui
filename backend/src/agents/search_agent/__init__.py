"""Search Agent - Web search-enabled conversational agent.

This agent can search the web using Tavily to answer questions
requiring current information, news, or real-time data.
"""

from .agent import search_agent

__all__ = ["search_agent"]
