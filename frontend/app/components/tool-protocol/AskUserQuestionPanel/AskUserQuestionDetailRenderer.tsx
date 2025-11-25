"use client";

import React, { useState } from "react";
import { ActionDetailRendererProps } from "../ActionDetailPanel";

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

interface AskUserQuestionArgs {
  questions_json?: string;
  _respond?: (response: any) => void;
  _isSubmitted?: boolean;
  _submittedAnswers?: Record<string, string[]> | null;
  _onSubmit?: (answers: Record<string, string[]>) => void;
}

/**
 * Detail renderer for AskUserQuestion in the canvas panel
 * Shows full questionnaire for user to answer
 */
export const AskUserQuestionDetailRenderer: React.FC<ActionDetailRendererProps> = ({
  status,
  args,
  result,
}) => {
  const typedArgs = args as AskUserQuestionArgs;

  // Parse questions
  let questions: Question[] = [];
  if (typedArgs.questions_json) {
    try {
      questions = JSON.parse(typedArgs.questions_json);
    } catch (e) {
      console.error("[AskUserQuestionDetailRenderer] Parse error:", e);
      return <ErrorView message="Failed to parse question data" />;
    }
  }

  // Check if already submitted
  const isSubmitted = typedArgs._isSubmitted || status === "complete";
  const submittedAnswers = typedArgs._submittedAnswers || (result as any)?.answers;

  if (!typedArgs.questions_json || questions.length === 0) {
    return <LoadingView />;
  }

  if (isSubmitted && submittedAnswers) {
    return <SubmittedView questions={questions} answers={submittedAnswers} />;
  }

  return (
    <QuestionnaireForm
      questions={questions}
      onSubmit={typedArgs._onSubmit}
    />
  );
};

/**
 * Loading state while questions are being prepared
 */
function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
      <p className="text-sm font-medium text-slate-700">Loading questions...</p>
    </div>
  );
}

/**
 * Error state when questions cannot be parsed
 */
function ErrorView({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-medium text-red-800">{message}</p>
      <p className="text-xs text-red-600 mt-1">Please contact technical support</p>
    </div>
  );
}

/**
 * View showing submitted answers (read-only)
 */
function SubmittedView({
  questions,
  answers,
}: {
  questions: Question[];
  answers: Record<string, string[]>;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Answers Submitted</h3>
          <p className="text-sm text-slate-600">Your answers have been successfully submitted</p>
        </div>
      </div>

      {/* Submitted Answers */}
      <div className="space-y-5">
        {questions.map((question, idx) => {
          const answer = answers[question.header] || [];

          return (
            <div key={idx} className="space-y-3">
              {/* Question Header */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  {question.header}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-slate-900">
                {question.question}
              </p>

              {/* Selected Answers */}
              <div className="space-y-2">
                {answer.length > 0 ? (
                  answer.map((selectedLabel) => {
                    const option = question.options.find(opt => opt.label === selectedLabel);
                    return (
                      <div
                        key={selectedLabel}
                        className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                      >
                        <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-sm">{selectedLabel}</div>
                          {option && (
                            <div className="text-xs text-slate-600 mt-1">{option.description}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-500 italic">No answer selected</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Interactive questionnaire form
 */
function QuestionnaireForm({
  questions,
  onSubmit,
}: {
  questions: Question[];
  onSubmit?: (answers: Record<string, string[]>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const handleAnswerChange = (header: string, selected: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [header]: selected,
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(answers);
    }
  };

  const allAnswered = questions.every((question) => {
    const selected = answers[question.header];
    return selected && selected.length > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
          <span className="text-2xl">❓</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Please answer the following questions</h3>
          <p className="text-sm text-slate-600">
            {questions.length} question(s) total · Please complete all before submitting
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, idx) => {
          const selectedAnswers = answers[question.header] || [];

          return (
            <div key={idx} className="space-y-3">
              {/* Question Header */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {question.header}
                </span>
                {question.multiSelect && (
                  <span className="text-xs text-slate-500">(Multiple choice)</span>
                )}
                <span className="text-xs text-slate-400">
                  {selectedAnswers.length > 0 ? `${selectedAnswers.length} selected` : "Not selected"}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-slate-900">
                {question.question}
              </p>

              {/* Options */}
              <QuestionItem
                question={question}
                selected={selectedAnswers}
                onChange={(selected) => handleAnswerChange(question.header, selected)}
              />
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-sm
            transition-all
            ${
              allAnswered
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm hover:shadow"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          {allAnswered ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Submit Answers
            </span>
          ) : (
            `Please answer all questions first (${questions.filter(q => {
              const selected = answers[q.header];
              return selected && selected.length > 0;
            }).length}/${questions.length})`
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Individual question item component with single/multi-select support
 */
interface QuestionItemProps {
  question: Question;
  selected: string[];
  onChange: (selected: string[]) => void;
}

function QuestionItem({ question, selected, onChange }: QuestionItemProps) {
  const handleSelect = (label: string) => {
    const newSelected = question.multiSelect
      ? selected.includes(label)
        ? selected.filter((s) => s !== label)
        : [...selected, label]
      : [label];

    onChange(newSelected);
  };

  return (
    <div className="space-y-2">
      {question.options.map((option) => {
        const isSelected = selected.includes(option.label);

        return (
          <button
            key={option.label}
            onClick={() => handleSelect(option.label)}
            className={`
              w-full text-left p-3 rounded-lg border-2 transition-all
              ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm"
              }
              cursor-pointer
            `}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox/Radio indicator */}
              <div
                className={`
                  mt-0.5 w-5 h-5 border-2 flex items-center justify-center shrink-0
                  ${question.multiSelect ? "rounded" : "rounded-full"}
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300"
                  }
                  transition-all
                `}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Option content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 text-sm">
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default AskUserQuestionDetailRenderer;
