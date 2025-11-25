"""Tavily search tool core implementation."""

from agno.tools.tavily import TavilyTools
from typing import Literal
import os

import dotenv

dotenv.load_dotenv()

def create_tavily_tool(
    api_key: str | None = None,
    enable_search: bool = True,
    include_answer: bool = False,
    max_tokens: int = 8000,
    search_depth: Literal["basic", "advanced"] = "advanced",
    format: Literal["json", "markdown"] = "json",
) -> TavilyTools:
    """
    Create and configure Tavily search tool instance.

    Args:
        api_key: Tavily API key. If not provided, reads from TAVILY_API_KEY env var
        enable_search: Whether to enable search functionality
        max_tokens: Maximum tokens for search results
        search_depth: Search depth level ("basic" or "advanced")
        format: Result format ("json" or "markdown")

    Returns:
        Configured TavilyTools instance

    Raises:
        ValueError: If API key is not provided and not found in environment

    Example:
        >>> tool = create_tavily_tool()
        >>> # Use with agent
        >>> agent = Agent(tools=[tool])
    """
    if api_key is None:
        api_key = os.getenv("TAVILY_API_KEY", "")
    
    print(f"Using Tavily API Key: {api_key}")  # Debugging line

    if not api_key:
        raise ValueError(
            "Tavily API key is required. Provide via api_key parameter or "
            "TAVILY_API_KEY environment variable."
        )

    return TavilyTools(
        api_key=api_key,
        enable_search=enable_search,
        include_answer=include_answer,
        max_tokens=max_tokens,
        search_depth=search_depth,
        format=format,
    )
