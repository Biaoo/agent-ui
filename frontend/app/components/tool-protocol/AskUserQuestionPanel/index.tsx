"use client";

import React, { useMemo, useId } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { ActionSummaryCard } from "../ActionSummaryCard";
import { useActionDetail, ActionDetail } from "../ActionDetailContext";
import { generateActionId } from "../utils";

type ActionStatus = "inProgress" | "executing" | "complete";

interface QuestionOption {
  label: string;
  description: string;
}

interface Question {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
}

interface AskUserQuestionArguments {
  questions_json?: string;
}

interface AskUserQuestionResponse {
  answers: Record<string, string[]>;
  questions_asked: number;
  status: string;
}

/**
 * Hook to register ask_user_question action with CopilotKit
 * Uses two-panel architecture: summary in chat, full questionnaire in canvas
 */
export function useAskUserQuestionAction(): void {
  const { selectAction } = useActionDetail();

  useCopilotAction({
    name: "ask_user_question",
    description: "Ask the user interactive questions with single or multiple choice options.",
    parameters: [
      {
        name: "questions_json",
        type: "string",
        description: "JSON string containing array of question objects",
        required: true,
      },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => (
      <AskUserQuestionRenderer
        args={args as AskUserQuestionArguments}
        status={status as ActionStatus}
        respond={respond}
        selectAction={selectAction}
      />
    ),
  });
}

interface AskUserQuestionRendererProps {
  args: AskUserQuestionArguments;
  status: ActionStatus;
  respond?: (response: any) => void;
  selectAction: (action: ActionDetail) => void;
}

/**
 * Renderer that shows summary card in chat and auto-opens canvas for user input
 */
function AskUserQuestionRenderer({
  args,
  status,
  respond,
  selectAction,
}: AskUserQuestionRendererProps) {
  const uniqueId = useId();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedAnswers, setSubmittedAnswers] = React.useState<Record<string, string[]> | null>(null);
  const [timestamp] = React.useState(() => Date.now());

  // Parse questions
  const questions = useMemo(() => {
    if (!args.questions_json) return [];
    try {
      return JSON.parse(args.questions_json) as Question[];
    } catch (e) {
      console.error("[AskUserQuestionRenderer] Parse error:", e);
      return [];
    }
  }, [args.questions_json]);

  // Create action detail object with stable ID
  const actionDetail = useMemo((): ActionDetail => {
    return {
      id: generateActionId("ask-user", uniqueId, args, status),
      actionName: "ask_user_question",
      status,
      args: {
        ...args,
        // Store respond callback and submission state in args for detail renderer
        _respond: respond,
        _isSubmitted: isSubmitted,
        _submittedAnswers: submittedAnswers,
        _onSubmit: (answers: Record<string, string[]>) => {
          setIsSubmitted(true);
          setSubmittedAnswers(answers);

          const result: AskUserQuestionResponse = {
            answers,
            questions_asked: questions.length,
            status: "completed",
          };

          console.log("[AskUserQuestionRenderer] Submitting:", result);
          if (respond) {
            respond(result);
          }
        },
      },
      result: submittedAnswers ? {
        answers: submittedAnswers,
        questions_asked: questions.length,
        status: "completed",
      } : null,
      timestamp,
    };
  }, [status, args, uniqueId, respond, isSubmitted, submittedAnswers, questions.length, timestamp]);

  // Auto-select to open detail panel when questions are loaded
  React.useEffect(() => {
    if (status === "executing" && questions.length > 0 && !isSubmitted) {
      selectAction(actionDetail);
    }
  }, [status, questions.length, isSubmitted, selectAction, actionDetail]);

  // Prepare parameter summary
  const parameterSummary = (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs">
        <span className="font-medium">Questions:</span> {questions.length}
      </span>
    </div>
  );

  // Prepare result summary
  const resultSummary = isSubmitted && submittedAnswers ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-green-600">
        ✓ Submitted {Object.keys(submittedAnswers).length} answer(s)
      </span>
    </div>
  ) : null;

  return (
    <ActionSummaryCard
      action={actionDetail}
      displayName="User Q&A"
      icon="❓"
      description={isSubmitted ? "User has completed answering" : "Waiting for user to answer questions"}
      parameterSummary={parameterSummary}
      resultSummary={resultSummary}
    />
  );
}

// Re-export the detail renderer
export { AskUserQuestionDetailRenderer } from "./AskUserQuestionDetailRenderer";
