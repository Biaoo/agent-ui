"""
Tests for the AskUserQuestion tool.
"""

import json
import pytest
from src.tools.ask_user_question import (
    ask_user_question,
    create_question,
    QuestionOption,
    Question
)


class TestQuestionOption:
    """Test QuestionOption class."""

    def test_create_option(self):
        """Test creating a question option."""
        option = QuestionOption(
            label="JWT",
            description="JSON Web Tokens - stateless"
        )
        assert option.label == "JWT"
        assert option.description == "JSON Web Tokens - stateless"

    def test_to_dict(self):
        """Test converting option to dictionary."""
        option = QuestionOption("OAuth", "Industry standard")
        result = option.to_dict()
        assert result == {
            "label": "OAuth",
            "description": "Industry standard"
        }


class TestQuestion:
    """Test Question class."""

    def test_create_question(self):
        """Test creating a question."""
        options = [
            QuestionOption("Option A", "First option"),
            QuestionOption("Option B", "Second option")
        ]
        question = Question(
            question="Which option?",
            header="Choice",
            options=options,
            multi_select=False
        )
        assert question.question == "Which option?"
        assert question.header == "Choice"
        assert len(question.options) == 2
        assert question.multi_select is False

    def test_header_length_validation(self):
        """Test that header length is validated."""
        options = [
            QuestionOption("A", "First"),
            QuestionOption("B", "Second")
        ]
        with pytest.raises(ValueError, match="exceeds 12 character limit"):
            Question(
                question="Test?",
                header="This is a very long header",
                options=options
            )

    def test_options_count_validation(self):
        """Test that options count is validated."""
        # Too few options
        with pytest.raises(ValueError, match="Must have 2-4 options"):
            Question(
                question="Test?",
                header="Test",
                options=[QuestionOption("A", "Only one")]
            )

        # Too many options
        with pytest.raises(ValueError, match="Must have 2-4 options"):
            Question(
                question="Test?",
                header="Test",
                options=[
                    QuestionOption("A", "First"),
                    QuestionOption("B", "Second"),
                    QuestionOption("C", "Third"),
                    QuestionOption("D", "Fourth"),
                    QuestionOption("E", "Fifth"),
                ]
            )

    def test_to_dict(self):
        """Test converting question to dictionary."""
        options = [
            QuestionOption("React", "UI library"),
            QuestionOption("Vue", "Framework")
        ]
        question = Question(
            question="Which framework?",
            header="Framework",
            options=options,
            multi_select=True
        )
        result = question.to_dict()
        assert result["question"] == "Which framework?"
        assert result["header"] == "Framework"
        assert result["multiSelect"] is True
        assert len(result["options"]) == 2


class TestCreateQuestionHelper:
    """Test the create_question helper function."""

    def test_create_question(self):
        """Test creating a question with the helper."""
        question = create_question(
            question="Which method?",
            header="Auth",
            options=[
                {"label": "JWT", "description": "Token-based"},
                {"label": "Session", "description": "Cookie-based"}
            ],
            multi_select=False
        )
        assert question["question"] == "Which method?"
        assert question["header"] == "Auth"
        assert len(question["options"]) == 2
        assert question["multiSelect"] is False


class TestAskUserQuestionTool:
    """Test the ask_user_question tool."""

    def test_initial_call_single_question(self):
        """Test initial call with a single question."""
        questions = [
            create_question(
                question="Which framework should we use?",
                header="Framework",
                options=[
                    {"label": "React", "description": "Popular UI library"},
                    {"label": "Vue", "description": "Progressive framework"}
                ]
            )
        ]
        questions_json = json.dumps(questions)

        # Call the main function directly
        result = ask_user_question(questions_json=questions_json)
        result_data = json.loads(result)

        assert result_data["status"] == "awaiting_user_input"
        assert result_data["total_questions"] == 1
        assert len(result_data["questions"]) == 1
        assert result_data["questions"][0]["question"] == "Which framework should we use?"

    def test_initial_call_multiple_questions(self):
        """Test initial call with multiple questions."""
        questions = [
            create_question(
                question="Which CSS framework?",
                header="Styling",
                options=[
                    {"label": "Tailwind", "description": "Utility-first"},
                    {"label": "Bootstrap", "description": "Component library"}
                ]
            ),
            create_question(
                question="Which state management?",
                header="State mgmt",
                options=[
                    {"label": "Redux", "description": "Predictable state"},
                    {"label": "Zustand", "description": "Lightweight"}
                ],
                multi_select=False
            )
        ]
        questions_json = json.dumps(questions)

        result = ask_user_question(questions_json=questions_json)
        result_data = json.loads(result)

        assert result_data["status"] == "awaiting_user_input"
        assert result_data["total_questions"] == 2
        assert len(result_data["questions"]) == 2

    def test_with_user_answers_single_choice(self):
        """Test tool with user answers for single choice."""
        questions = [
            create_question(
                question="Which framework?",
                header="Framework",
                options=[
                    {"label": "React", "description": "UI library"},
                    {"label": "Vue", "description": "Framework"}
                ]
            )
        ]
        questions_json = json.dumps(questions)
        user_answers = json.dumps({
            "question_0": ["React"]
        })

        result = ask_user_question(
            questions_json=questions_json,
            user_answers=user_answers
        )
        result_data = json.loads(result)

        assert result_data["status"] == "completed"
        assert result_data["questions_asked"] == 1
        assert result_data["answers"]["Framework"] == ["React"]

    def test_with_user_answers_multiple_choice(self):
        """Test tool with user answers for multiple choice."""
        questions = [
            create_question(
                question="Which features do you want?",
                header="Features",
                options=[
                    {"label": "Dark mode", "description": "Theme toggle"},
                    {"label": "Analytics", "description": "Track metrics"},
                    {"label": "i18n", "description": "Internationalization"}
                ],
                multi_select=True
            )
        ]
        questions_json = json.dumps(questions)
        user_answers = json.dumps({
            "question_0": ["Dark mode", "Analytics"]
        })

        result = ask_user_question(
            questions_json=questions_json,
            user_answers=user_answers
        )
        result_data = json.loads(result)

        assert result_data["status"] == "completed"
        assert result_data["questions_asked"] == 1
        assert "Dark mode" in result_data["answers"]["Features"]
        assert "Analytics" in result_data["answers"]["Features"]
        assert len(result_data["answers"]["Features"]) == 2

    def test_with_multiple_questions_and_answers(self):
        """Test tool with multiple questions and answers."""
        questions = [
            create_question(
                question="Which framework?",
                header="Framework",
                options=[
                    {"label": "React", "description": "UI library"},
                    {"label": "Vue", "description": "Framework"}
                ]
            ),
            create_question(
                question="Which features?",
                header="Features",
                options=[
                    {"label": "Auth", "description": "Authentication"},
                    {"label": "DB", "description": "Database"}
                ],
                multi_select=True
            )
        ]
        questions_json = json.dumps(questions)
        user_answers = json.dumps({
            "question_0": ["React"],
            "question_1": ["Auth", "DB"]
        })

        result = ask_user_question(
            questions_json=questions_json,
            user_answers=user_answers
        )
        result_data = json.loads(result)

        assert result_data["status"] == "completed"
        assert result_data["questions_asked"] == 2
        assert result_data["answers"]["Framework"] == ["React"]
        assert result_data["answers"]["Features"] == ["Auth", "DB"]

    def test_invalid_questions_json(self):
        """Test with invalid questions JSON."""
        result = ask_user_question(questions_json="invalid json")
        result_data = json.loads(result)
        assert result_data["status"] == "failed"
        assert "error" in result_data

    def test_questions_not_array(self):
        """Test with questions that's not an array."""
        result = ask_user_question(questions_json='{"not": "array"}')
        result_data = json.loads(result)
        assert result_data["status"] == "failed"
        assert "error" in result_data

    def test_too_many_questions(self):
        """Test with more than 4 questions."""
        questions = [
            create_question(
                question=f"Question {i}?",
                header=f"Q{i}",
                options=[
                    {"label": "A", "description": "First"},
                    {"label": "B", "description": "Second"}
                ]
            ) for i in range(5)
        ]
        result = ask_user_question(questions_json=json.dumps(questions))
        result_data = json.loads(result)
        assert result_data["status"] == "failed"
        assert "1-4 questions" in result_data["error"]

    def test_missing_question_fields(self):
        """Test with missing required fields in question."""
        questions = [
            {
                "question": "Test?",
                # Missing header, options, multiSelect
            }
        ]
        result = ask_user_question(questions_json=json.dumps(questions))
        result_data = json.loads(result)
        assert result_data["status"] == "failed"
        assert "error" in result_data

    def test_missing_option_fields(self):
        """Test with missing fields in options."""
        questions = [
            {
                "question": "Test?",
                "header": "Test",
                "multiSelect": False,
                "options": [
                    {"label": "A"},  # Missing description
                    {"description": "Second"}  # Missing label
                ]
            }
        ]
        result = ask_user_question(questions_json=json.dumps(questions))
        result_data = json.loads(result)
        assert result_data["status"] == "failed"
        assert "error" in result_data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
