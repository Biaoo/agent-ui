from pathlib import Path
import sys
from agno.models.message import Message
from typing import Iterator, Any, Union, cast
from agno.agent import (
    RunOutput,
    RunOutputEvent,
    RunContentEvent,
    RunEvent,
    ToolCallStartedEvent,
    ToolCallCompletedEvent,
)
from agno.utils.pprint import pprint_run_response
from httpx import stream

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.agents.search_agent import search_agent


def print_response():
    print("########## Feature 1: Print Response ##########")
    search_agent.print_response(
        Message(role="user", content="查询一下HiQLCD数据库的信息"), stream=True
    )


def agent_run():
    print("########## Feature 2: Agent Run ##########")

    response = search_agent.run(
        Message(role="user", content="查询一下HiQLCD数据库的信息")
    )

    # 显示工具调用信息
    # if hasattr(response, 'tools') and response.tools:
    #     print("\n=== Tool Calls Found ===")
    #     for tool in response.tools:
    #         print(f"Tool: {tool.tool_name}")
    #         print(f"Args: {tool.tool_args}")
    #         print(f"Result: {tool.result[:200]}...")
    #         print("---")

    pprint_run_response(response, show_time=True)


def custom_print():
    print("########## Feature 3: Custom Print ##########")
    response = search_agent.run(
        Message(role="user", content="查询一下HiQLCD数据库的信息"), stream=True
    )

    if isinstance(response, Iterator):
        print("\n=== Streaming Events ===")
        for i, chunk in enumerate(response):
            print(f"Event {i}: {type(chunk).__name__}")

            if isinstance(chunk, RunOutputEvent):
                print(f"  Event type: {chunk.event}")

                if chunk.event == RunEvent.run_content:
                    chunk = cast(RunContentEvent,chunk)
                    print(f"  [Run Content]")
                    print(chunk.content)

                elif chunk.event == RunEvent.tool_call_started:
                    chunk = cast(ToolCallStartedEvent,chunk)
                    print(f"  [Tool Call Started]")
                    print(f"  Tool info: {chunk.tool}")

                elif chunk.event == RunEvent.tool_call_completed:
                    chunk = cast(ToolCallCompletedEvent,chunk)
                    print(f"  [Tool Call Completed]")
                    if chunk.tool:
                        print(f"  Tool result: {chunk.tool.to_dict()}...")



if __name__ == "__main__":
    # 测试非流式调用看工具调用
    agent_run()
    # # 测试流式调用
    # print_response()
    # custom_print()

