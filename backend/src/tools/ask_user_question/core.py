"""
AskUserQuestion Core Implementation.

This module contains the core logic for asking users interactive questions.
Separated from the tool wrapper to allow direct function calls in tests.
"""

from typing import List, Dict, Any, Optional
import json
from loguru import logger


class QuestionOption:
    """Represents a single option in a question."""

    def __init__(self, label: str, description: str):
        """
        Initialize a question option.

        Args:
            label: The display text for this option (1-5 words)
            description: Explanation of what this option means
        """
        self.label = label
        self.description = description

    def to_dict(self) -> Dict[str, str]:
        """Convert to dictionary representation."""
        return {"label": self.label, "description": self.description}


class Question:
    """Represents a single question with options."""

    def __init__(
        self,
        question: str,
        header: str,
        options: List[QuestionOption],
        multi_select: bool = False,
    ):
        """
        Initialize a question.

        Args:
            question: The complete question to ask (should end with ?)
            header: Short label displayed as chip/tag (max 12 chars)
            options: List of 2-4 QuestionOption objects
            multi_select: If True, allow multiple selections
        """
        if len(header) > 12:
            raise ValueError(f"Header '{header}' exceeds 12 character limit")

        if not 2 <= len(options) <= 4:
            raise ValueError(f"Must have 2-4 options, got {len(options)}")

        if not question.strip().endswith("?"):
            logger.warning(f"Question should end with '?': {question}")

        self.question = question
        self.header = header
        self.options = options
        self.multi_select = multi_select

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "question": self.question,
            "header": self.header,
            "options": [opt.to_dict() for opt in self.options],
            "multiSelect": self.multi_select,
        }


def ask_user_question(questions_json: str, user_answers: Optional[str] = None) -> str:
    """
    Ask the user interactive questions with single or multiple choice options.

    This is the main implementation function that can be called directly in tests
    or wrapped by the @tool decorator for agent use.

    Args:
        questions_json: JSON string containing a list of question objects.
            Each question must have:
            - question (str): The complete question ending with '?'
            - header (str): Short label (max 12 chars) like "Auth method"
            - options (list): 2-4 option objects with 'label' and 'description'
            - multiSelect (bool): True for multiple choice, False for single choice

            Example:
            ```json
            [
                {
                    "question": "Which authentication method should we use?",
                    "header": "Auth method",
                    "multiSelect": false,
                    "options": [
                        {
                            "label": "JWT",
                            "description": "JSON Web Tokens - stateless, good for APIs"
                        },
                        {
                            "label": "OAuth 2.0",
                            "description": "Industry standard, supports third-party login"
                        }
                    ]
                }
            ]
            ```

        user_answers: JSON string containing user's answers. This field will be
            populated by the user during the human-in-the-loop flow.
            Format: {"question_0": ["selected_label"], "question_1": ["label1", "label2"]}

    Returns:
        JSON string containing the user's answers in a structured format:
        {
            "answers": {
                "Auth method": ["JWT"],
                "Features": ["Dark mode", "Analytics"]
            },
            "questions_asked": 2,
            "status": "completed"
        }

    Raises:
        ValueError: If questions_json is invalid or doesn't meet requirements

    Example:
        >>> questions = [{
        ...     "question": "Which framework?",
        ...     "header": "Framework",
        ...     "multiSelect": False,
        ...     "options": [
        ...         {"label": "React", "description": "UI library"},
        ...         {"label": "Vue", "description": "Framework"}
        ...     ]
        ... }]
        >>> result = ask_user_question(json.dumps(questions))
        >>> # User provides answer...
        >>> result = ask_user_question(
        ...     json.dumps(questions),
        ...     json.dumps({"question_0": ["React"]})
        ... )
    """
    try:
        # Parse the questions JSON
        try:
            questions_data = json.loads(questions_json)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid questions_json format: {e}")

        if not isinstance(questions_data, list):
            raise ValueError("questions_json must be a JSON array of question objects")

        if not 1 <= len(questions_data) <= 4:
            raise ValueError(f"Must ask 1-4 questions, got {len(questions_data)}")

        # Validate and parse questions
        questions: List[Question] = []
        for idx, q_data in enumerate(questions_data):
            try:
                # Validate required fields
                if not all(
                    k in q_data
                    for k in ["question", "header", "options", "multiSelect"]
                ):
                    raise ValueError(f"Question {idx} missing required fields")

                # Parse options
                options = []
                for opt_data in q_data["options"]:
                    if not all(k in opt_data for k in ["label", "description"]):
                        raise ValueError(
                            f"Option in question {idx} missing 'label' or 'description'"
                        )
                    options.append(
                        QuestionOption(
                            label=opt_data["label"], description=opt_data["description"]
                        )
                    )

                # Create question object
                question = Question(
                    question=q_data["question"],
                    header=q_data["header"],
                    options=options,
                    multi_select=q_data["multiSelect"],
                )
                questions.append(question)

            except Exception as e:
                raise ValueError(f"Error parsing question {idx}: {e}")

        # If user_answers is not provided, we're in the initial call
        # The tool will pause here and wait for user input
        if user_answers is None:
            logger.info(f"Waiting for user to answer {len(questions)} question(s)")
            # Format questions for display
            formatted_questions = {
                "questions": [q.to_dict() for q in questions],
                "total_questions": len(questions),
                "status": "awaiting_user_input",
            }
            return json.dumps(formatted_questions, ensure_ascii=False, indent=2)

        # Parse user answers
        try:
            answers_data = (
                json.loads(user_answers)
                if isinstance(user_answers, str)
                else user_answers
            )
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid user_answers format: {e}")

        # Build response with answers mapped by header
        result = {
            "answers": {},
            "questions_asked": len(questions),
            "status": "completed",
        }

        for idx, question in enumerate(questions):
            question_key = f"question_{idx}"
            header = question.header

            if question_key in answers_data:
                user_selection = answers_data[question_key]
                # Ensure it's a list
                if not isinstance(user_selection, list):
                    user_selection = [user_selection]
                result["answers"][header] = user_selection
            else:
                logger.warning(f"No answer provided for question: {header}")
                result["answers"][header] = []

        logger.info(f"User answered {len(questions)} question(s): {result['answers']}")
        return json.dumps(result, ensure_ascii=False, indent=2)

    except Exception as e:
        logger.error(f"AskUserQuestion tool failed: {e}", exc_info=True)
        return json.dumps(
            {"error": str(e), "status": "failed"}, ensure_ascii=False, indent=2
        )


# Convenience function for creating questions programmatically
def create_question(
    question: str,
    header: str,
    options: List[Dict[str, str]],
    multi_select: bool = False,
) -> Dict[str, Any]:
    """
    Helper function to create a question dictionary.

    Args:
        question: The question text (should end with '?')
        header: Short label (max 12 chars)
        options: List of dicts with 'label' and 'description' keys
        multi_select: Whether to allow multiple selections

    Returns:
        Dictionary representing a question

    Example:
        >>> q = create_question(
        ...     question="Which framework?",
        ...     header="Framework",
        ...     options=[
        ...         {"label": "React", "description": "Popular UI library"},
        ...         {"label": "Vue", "description": "Progressive framework"}
        ...     ]
        ... )
    """
    return {
        "question": question,
        "header": header,
        "options": options,
        "multiSelect": multi_select,
    }
