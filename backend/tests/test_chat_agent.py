from pathlib import Path
import sys
from agno.models.message import Message
from typing import Iterator, Any, Union, cast
from agno.agent import RunOutput, RunOutputEvent, RunEvent
from agno.utils.pprint import pprint_run_response

sys.path.append(str(Path(__file__).resolve().parent.parent))
from src.agents.chat_agent import chat_agent


def print_response():
    print("########## Feature 1: Print Response ##########")
    chat_agent.print_response(
        Message(role="user", content="Hello, Introduce Yourself."), stream=True
    )


def agent_run():
    print("########## Feature 2: Agent Run ##########")
    
    response: Union[RunOutput, Iterator[Union[RunOutputEvent, RunOutput]]]= chat_agent.run(
        Message(role="user", content="Hello, Introduce Yourself.")
    )

    pprint_run_response(response)

    # Print the response
    # if isinstance(response, Iterator):
    #     for chunk in response:
    #         if isinstance(chunk, RunOutputEvent):
    #             if chunk.event == RunEvent.run_content:
    #                 print(chunk.content, end="", flush=True)
    #         elif isinstance(chunk, RunOutput):
    #             print(chunk.content, end="", flush=True)
    # else:
    #     pprint_run_response(response)
    


def stream_run():
    print("########## Feature 3: Stream Run ##########")
    stream: Iterator[RunOutputEvent | RunOutput] = chat_agent.run(Message(role="user", content="Hello, Introduce Yourself."), stream=True)
    for chunk in stream:
        # 检查 chunk 的类型，处理 RunOutputEvent 和 RunOutput 两种情况
        if isinstance(chunk, RunOutputEvent):
            if chunk.event == RunEvent.run_content:
                print(chunk.content)
        elif isinstance(chunk, RunOutput):
            print(chunk.content)


if __name__ == "__main__":
    # print_response()
    agent_run()
    # stream_run()
