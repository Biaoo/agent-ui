"""Tavily web search tool integration."""

from .core import create_tavily_tool
import os

# Create default tool instance (only if API key is available)
tavily_tool = None
if os.getenv("TAVILY_API_KEY"):
    try:
        tavily_tool = create_tavily_tool()
    except Exception:
        # API key might be invalid, let users configure manually
        pass

__all__ = ["tavily_tool", "create_tavily_tool"]
