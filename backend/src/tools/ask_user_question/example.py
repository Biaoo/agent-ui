"""
Example usage of the AskUserQuestion tool with Agno agents.

This example demonstrates how to use the AskUserQuestion tool to gather
user preferences during agent execution using Human-in-the-Loop patterns.
"""

import json
from typing import List
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.function import UserInputField
from agno.utils import pprint
from rich.console import Console
from rich.prompt import Prompt

from src.tools.ask_user_question import ask_user_question, create_question
from src.tools.user_control_flow import collect_user_feedback_tool
from src.config.model_config import qwen_model_config


console = Console()


def example_single_question():
    """Example 1: Ask a single question to the user."""
    console.print("\n[bold cyan]Example 1: Single Question[/]\n")

    # Create an agent with the ask_user_question tool
    model = OpenAIChat(
        id=qwen_model_config.model_name,
        api_key=qwen_model_config.api_key,
        base_url=qwen_model_config.base_url,
    )

    agent = Agent(
        name="DecisionAgent",
        model=model,
        tools=[ask_user_question],
        instructions=[
            "You are a helpful assistant that helps users make technical decisions.",
            "When you need user input to make a decision, use the ask_user_question tool.",
        ],
        markdown=True,
    )

    # Create a question about framework choice
    questions = [
        create_question(
            question="Which web framework should we use for this project?",
            header="Framework",
            options=[
                {
                    "label": "FastAPI",
                    "description": "Modern, fast, based on Python type hints",
                },
                {"label": "Flask", "description": "Lightweight, flexible, minimal"},
                {"label": "Django", "description": "Batteries-included, full-featured"},
            ],
            multi_select=False,
        )
    ]

    # Simulate the agent calling the tool
    console.print("[yellow]Agent is asking a question...[/]\n")
    result = ask_user_question(questions_json=json.dumps(questions))
    result_data = json.loads(result)

    console.print(f"Status: {result_data['status']}")
    console.print(f"Question: {result_data['questions'][0]['question']}")
    console.print("\nOptions:")
    for opt in result_data["questions"][0]["options"]:
        console.print(f"  - {opt['label']}: {opt['description']}")

    # Simulate user providing answer
    user_choice = Prompt.ask(
        "\nYour choice", choices=["FastAPI", "Flask", "Django"], default="FastAPI"
    )

    user_answers = json.dumps({"question_0": [user_choice]})

    # Get final result
    final_result = ask_user_question(
        questions_json=json.dumps(questions), user_answers=user_answers
    )
    final_data = json.loads(final_result)

    console.print("\n[green]User answered:[/]")
    console.print(f"Framework: {final_data['answers']['Framework'][0]}")


def example_multiple_questions():
    """Example 2: Ask multiple questions at once."""
    console.print("\n[bold cyan]Example 2: Multiple Questions[/]\n")

    questions = [
        create_question(
            question="Which authentication method should we use?",
            header="Auth method",
            options=[
                {
                    "label": "JWT",
                    "description": "JSON Web Tokens - stateless, good for APIs",
                },
                {
                    "label": "OAuth 2.0",
                    "description": "Industry standard, supports third-party login",
                },
                {
                    "label": "Session",
                    "description": "Traditional cookies, simpler but requires server state",
                },
            ],
            multi_select=False,
        ),
        create_question(
            question="Which features do you want to enable?",
            header="Features",
            options=[
                {
                    "label": "Dark mode",
                    "description": "Toggle between light and dark themes",
                },
                {
                    "label": "Analytics",
                    "description": "Track user behavior and metrics",
                },
                {"label": "i18n", "description": "Internationalization support"},
            ],
            multi_select=True,  # Allow multiple selections
        ),
    ]

    # Initial call - tool waits for user input
    result = ask_user_question(questions_json=json.dumps(questions))
    result_data = json.loads(result)

    console.print("[yellow]Agent is asking multiple questions...[/]\n")

    # Display questions
    for idx, q in enumerate(result_data["questions"]):
        console.print(f"[bold]Question {idx + 1}:[/] {q['question']}")
        console.print(
            f"Type: {'Multiple choice' if q['multiSelect'] else 'Single choice'}"
        )
        console.print("Options:")
        for opt in q["options"]:
            console.print(f"  - {opt['label']}: {opt['description']}")
        console.print()

    # Simulate user answers
    user_answers = json.dumps(
        {
            "question_0": ["JWT"],
            "question_1": ["Dark mode", "Analytics"],  # Multiple selections
        }
    )

    # Get final result
    final_result = ask_user_question(
        questions_json=json.dumps(questions), user_answers=user_answers
    )
    final_data = json.loads(final_result)

    console.print("[green]User answers:[/]")
    for header, answer in final_data["answers"].items():
        console.print(f"{header}: {', '.join(answer)}")


def example_with_agent_run(auto_mode=False):
    """Example 3: Full agent workflow with manual HITL simulation.

    Note: Due to limitations with Qwen model's tool calling behavior,
    we manually simulate the HITL flow instead of relying on Agno's
    automatic requires_user_input mechanism.

    Args:
        auto_mode: If True, use default answers instead of prompting user
    """
    console.print("\n[bold cyan]Example 3: Full Agent Workflow (Manual HITL)[/]\n")

    if auto_mode:
        console.print("[yellow]Running in auto mode (using default answers)[/]\n")

    # For this example, we'll demonstrate the HITL pattern manually
    # by calling the ask_user_question tool directly

    # Step 1: Create questions
    questions = [
        create_question(
            question="Which web framework should we use for this project?",
            header="Framework",
            options=[
                {
                    "label": "FastAPI",
                    "description": "Modern, fast, based on Python type hints",
                },
                {"label": "Flask", "description": "Lightweight, flexible, minimal"},
                {"label": "Django", "description": "Batteries-included, full-featured"},
            ],
            multi_select=False,
        ),
        create_question(
            question="Which database should we use?",
            header="Database",
            options=[
                {
                    "label": "PostgreSQL",
                    "description": "Powerful, open source relational database",
                },
                {"label": "MongoDB", "description": "NoSQL document database"},
                {"label": "SQLite", "description": "Lightweight, serverless database"},
            ],
            multi_select=False,
        ),
        create_question(
            question="Which features do you want to enable?",
            header="Features",
            options=[
                {
                    "label": "Authentication",
                    "description": "User login and authentication",
                },
                {"label": "API", "description": "RESTful API endpoints"},
                {"label": "Admin Panel", "description": "Administrative interface"},
            ],
            multi_select=True,
        ),
    ]

    # Step 2: Initial call to get the questions formatted
    console.print("[yellow]Agent is asking questions...[/]\n")
    initial_result = ask_user_question(questions_json=json.dumps(questions))
    initial_data = json.loads(initial_result)

    # Step 3: Display questions and collect user answers
    console.print("[yellow]Please answer the following questions:[/]\n")
    user_answers = {}

    for idx, q in enumerate(initial_data["questions"]):
        console.print(f"\n[bold]Question {idx + 1}:[/] {q['question']}")
        console.print(f"[cyan]({q['header']})[/]")
        is_multi = q["multiSelect"]
        console.print(
            f"Type: {'Multiple choice (comma-separated)' if is_multi else 'Single choice'}"
        )
        console.print("Options:")

        # Display options with numbers
        for opt_idx, opt in enumerate(q["options"], 1):
            console.print(
                f"  {opt_idx}. [green]{opt['label']}[/]: {opt['description']}"
            )

        # Collect user input
        if auto_mode:
            # Auto mode: use defaults
            if is_multi:
                # Select first option for multi-choice
                selected_labels = [q["options"][0]["label"]]
                user_answers[f"question_{idx}"] = selected_labels
                console.print(
                    f"[green]✓ Auto-selected: {', '.join(selected_labels)}[/]"
                )
            else:
                # Select first option for single-choice
                selected_label = q["options"][0]["label"]
                user_answers[f"question_{idx}"] = [selected_label]
                console.print(f"[green]✓ Auto-selected: {selected_label}[/]")
        else:
            # Interactive mode: prompt user
            while True:
                try:
                    if is_multi:
                        user_input = Prompt.ask(
                            "\nYour choice(s) (enter numbers separated by commas, e.g., 1,3)",
                            default="1",
                        )
                        # Parse comma-separated numbers
                        choices = [int(c.strip()) for c in user_input.split(",")]
                        # Validate choices
                        if all(1 <= c <= len(q["options"]) for c in choices):
                            selected_labels = [
                                q["options"][c - 1]["label"] for c in choices
                            ]
                            user_answers[f"question_{idx}"] = selected_labels
                            console.print(
                                f"[green]✓ Selected: {', '.join(selected_labels)}[/]"
                            )
                            break
                        else:
                            console.print(
                                "[red]Invalid choice. Please enter valid option numbers.[/]"
                            )
                    else:
                        user_input = Prompt.ask(
                            "\nYour choice (enter option number)",
                            choices=[str(i) for i in range(1, len(q["options"]) + 1)],
                            default="1",
                        )
                        choice_idx = int(user_input) - 1
                        selected_label = q["options"][choice_idx]["label"]
                        user_answers[f"question_{idx}"] = [selected_label]
                        console.print(f"[green]✓ Selected: {selected_label}[/]")
                        break
                except (EOFError, KeyboardInterrupt):
                    # Handle non-interactive environment
                    console.print(
                        "\n[yellow]Non-interactive mode detected, using default answers[/]"
                    )
                    if is_multi:
                        selected_labels = [q["options"][0]["label"]]
                        user_answers[f"question_{idx}"] = selected_labels
                        console.print(
                            f"[green]✓ Auto-selected: {', '.join(selected_labels)}[/]"
                        )
                    else:
                        selected_label = q["options"][0]["label"]
                        user_answers[f"question_{idx}"] = [selected_label]
                        console.print(f"[green]✓ Auto-selected: {selected_label}[/]")
                    break
                except ValueError:
                    console.print(
                        "[red]Invalid format. Please enter numbers separated by commas.[/]"
                    )

    # Step 4: Call tool again with user answers
    console.print("\n[yellow]Processing your answers...[/]\n")
    final_result = ask_user_question(
        questions_json=json.dumps(questions), user_answers=json.dumps(user_answers)
    )
    final_data = json.loads(final_result)

    # Step 5: Display results
    console.print("[green]✓ Your selections:[/]")
    for header, answer in final_data["answers"].items():
        console.print(f"  {header}: {', '.join(answer)}")

    console.print("\n[green]✓ HITL interaction completed successfully![/]")
    console.print(
        "\n[dim]Note: In a real agent workflow, the agent would use these "
        "answers to continue its task (e.g., generating project setup code).[/]"
    )


def example_error_handling():
    """Example 4: Error handling."""
    console.print("\n[bold cyan]Example 4: Error Handling[/]\n")

    # Test invalid JSON
    console.print("[yellow]Testing invalid JSON...[/]")
    result = ask_user_question(questions_json="invalid json")
    result_data = json.loads(result)
    console.print(f"Status: {result_data['status']}")
    console.print(f"Error: {result_data.get('error', 'N/A')}\n")

    # Test missing fields
    console.print("[yellow]Testing missing fields...[/]")
    invalid_questions = [
        {
            "question": "Test?",
            # Missing required fields
        }
    ]
    result = ask_user_question(questions_json=json.dumps(invalid_questions))
    result_data = json.loads(result)
    console.print(f"Status: {result_data['status']}")
    console.print(f"Error: {result_data.get('error', 'N/A')}\n")


def example_dynamic_user_input():
    """Example 5: Dynamic user input with UserControlFlowTools."""
    console.print("\n[bold cyan]Example 5: Dynamic User Input (Advanced)[/]\n")

    model = OpenAIChat(
        id=qwen_model_config.model_name,
        api_key=qwen_model_config.api_key,
        base_url=qwen_model_config.base_url,
    )
    # 为通义千问API修正角色映射
    model.default_role_map = {
        "system": "system",
        "user": "user",
        "assistant": "assistant",
        "tool": "tool",
        "model": "assistant",
    }

    agent = Agent(
        name="DynamicInputAgent",
        model=model,
        tools=[collect_user_feedback_tool],
        instructions=[
            "You are an email assistant.",
            "When you need information from the user, use the collect_user_feedback tool.",
            "MUST use the tool to collect the recipient email address and email subject.",
            "DO NOT make assumptions - always ask the user.",
        ],
        markdown=True,
    )

    # Run the agent with a task that requires dynamic user input
    console.print("[yellow]Starting agent with dynamic input task...[/]\n")
    console.print("Task: Send an email about the project status\n")

    run_response = agent.run(
        "I need to send an email about the project status. "
        "Please use the collect_user_feedback tool to ask me for the recipient's email address and the subject line."
    )

    # Use a while loop to continue running until the agent is satisfied with the user input
    iteration = 0
    max_iterations = 5  # Prevent infinite loops

    while run_response.is_paused and iteration < max_iterations:
        iteration += 1
        console.print(f"\n[bold blue]Iteration {iteration}:[/]")

        for tool in run_response.tools_requiring_user_input:
            if tool.user_input_schema:
                input_schema: List[UserInputField] = tool.user_input_schema

                for field in input_schema:
                    # Display field information to the user
                    console.print(f"\n[bold]Field:[/] {field.name}")
                    console.print(f"Description: {field.description}")
                    console.print(f"Type: {field.field_type.__name__}")

                    # Get user input (if the value is not set, it means the user needs to provide the value)
                    if field.value is None:
                        user_value = input(f"Please enter a value for {field.name}: ")
                        field.value = user_value
                    else:
                        console.print(f"Value provided by agent: {field.value}")

        # Continue the agent run
        run_response = agent.continue_run(run_response=run_response)

        # If the agent is not paused for input, we are done
        if not run_response.is_paused:
            console.print("\n[green]Agent has completed the task![/]")
            pprint.pprint_run_response(run_response)
            break

    if iteration >= max_iterations:
        console.print("\n[red]Warning: Maximum iterations reached[/]")


def main():
    """Run all examples."""
    console.print("[bold green]AskUserQuestion Tool Examples[/]\n")
    console.print("=" * 60)

    try:
        # example_single_question()
        # console.print("\n" + "=" * 60)

        # example_multiple_questions()
        # console.print("\n" + "=" * 60)

        # Uncomment to test full agent workflow with structured questions
        example_with_agent_run()
        console.print("\n" + "=" * 60)

        # Uncomment to test dynamic user input workflow
        # example_dynamic_user_input()
        # console.print("\n" + "=" * 60)

        # example_error_handling()
        # console.print("\n" + "=" * 60)

        console.print("\n[bold green]All examples completed![/]")
    except Exception as e:
        # Print error without markup to avoid Rich parsing issues
        console.print("\n[bold red]Error occurred:[/]")
        console.print(str(e), markup=False)
        import traceback

        console.print("\n[dim]Traceback:[/]")
        console.print(traceback.format_exc(), markup=False)


if __name__ == "__main__":
    main()
