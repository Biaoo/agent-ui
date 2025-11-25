"""
FastAPI server for AI Agent services with AG-UI protocol integration.
"""

import argparse
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from agno.os import AgentOS
from agno.os.interfaces.agui import AGUI
from loguru import logger


# Load environment variables
load_dotenv()

# Configure logging
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
)

# Import agents
from src.agents.chat_agent import chat_agent
from src.agents.search_agent import search_agent


# Create AgentOS with multiple agents
# Each agent gets its own AGUI endpoint with a unique prefix
# Note: AGUI adds "/agui" suffix automatically, so prefix="/chat" results in "/chat/agui"
agent_os = AgentOS(
    id="agent-ui-backend",
    description="AI Agent backend with chat and search capabilities",
    agents=[chat_agent, search_agent],
    # Expose all agents via AG-UI with different prefixes
    interfaces=[
        AGUI(chat_agent, prefix="/chat"),  # Results in /chat/agui
        AGUI(search_agent, prefix="/search"),  # Results in /search/agui
    ],
)

# Get the FastAPI app from AgentOS
app = agent_os.get_app()


# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


if agent_os.agents:
    logger.info(
        f"AgentOS initialized with agents: {[agent.name for agent in agent_os.agents]}"
    )
else:
    logger.info("AgentOS initialized with no agents")


def main():
    """Main function to start the server."""
    parser = argparse.ArgumentParser(description="Start the AI Agent server")
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HOST", "0.0.0.0"),
        help="Host to bind the server (default: 0.0.0.0 or HOST env var)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", "7777")),
        help="Port to bind the server (default: 7777 or PORT env var)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=False,
        help="Enable auto-reload on file changes (development mode)",
    )
    args = parser.parse_args()

    mode = "development" if args.reload else "production"
    print(f"Starting server in {mode} mode at http://{args.host}:{args.port}")
    print(f"API docs available at http://{args.host}:{args.port}/docs")
    print(f"WebSocket endpoint at ws://{args.host}:{args.port}/ws")
    agent_os.serve(
        app="src.server:app", host=args.host, port=args.port, reload=args.reload
    )


def main_dev():
    """Entry point for development mode with auto-reload."""
    # Insert --reload into sys.argv if not already present
    if "--reload" not in sys.argv:
        sys.argv.insert(1, "--reload")
    main()


if __name__ == "__main__":
    main()
