"use client";

import { useQuizStore } from "../store/useQuizStore";
import { useTimer } from "../hooks/useTimer";
import { Timer } from "./Timer";
import { TOTAL_QUESTIONS } from "@/constants/quiz";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, X, Clock } from "lucide-react";

type OptionStatus = "idle" | "correct" | "incorrect";

const DIFFICULTY_BADGE_CLASS: Record<string, string> = {
  easy: "bg-correct-light text-easy border-transparent",
  medium: "bg-timeout-light text-medium border-transparent",
  hard: "bg-incorrect-light text-hard border-transparent",
};

const DIFFICULTY_EMOJI: Record<string, string> = {
  easy: "🟢",
  medium: "🟡",
  hard: "🔴",
};

export function QuizScreen() {
  useTimer();

  const questions = useQuizStore((s) => s.questions);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const score = useQuizStore((s) => s.score);
  const selectedAnswer = useQuizStore((s) => s.selectedAnswer);
  const isAnswerRevealed = useQuizStore((s) => s.isAnswerRevealed);
  const selectAnswer = useQuizStore((s) => s.selectAnswer);

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const questionNumber = currentQuestionIndex + 1;

  const getOptionStatus = (option: string): OptionStatus => {
    if (!isAnswerRevealed) return "idle";
    if (option === currentQuestion.correctAnswer) return "correct";
    if (selectedAnswer === null) return "idle";
    if (option === selectedAnswer) return "incorrect";
    return "idle";
  };

  const progressPercent = (currentQuestionIndex / TOTAL_QUESTIONS) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Progress Bar ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-secondary">
            Question {questionNumber} of {TOTAL_QUESTIONS}
          </span>
          <span className="text-sm font-semibold text-accent-2">{score} pts</span>
        </div>
        <Progress
          value={progressPercent}
          className="h-1.5 bg-border [&>div]:bg-accent-2 [&>div]:transition-[width] [&>div]:duration-400"
        />
      </div>

      {/* ── Question Card ── */}
      <Card
        key={currentQuestion.id}
        className="p-4 sm:p-6 space-y-6 animate-fade-in-scale shadow-md rounded-xl"
      >
        {/* — Header: Category, Difficulty, Timer — */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-tertiary">
              {currentQuestion.category}
            </p>
            <Badge
              className={cn(
                "font-medium capitalize gap-1",
                DIFFICULTY_BADGE_CLASS[currentQuestion.difficulty]
              )}
            >
              {DIFFICULTY_EMOJI[currentQuestion.difficulty]} {currentQuestion.difficulty}
            </Badge>
          </div>

          <Timer />
        </div>

        {/* — Teks Soal — */}
        <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight text-text-primary">
          {currentQuestion.question}
        </h2>

        {/* — Answer Options — */}
        <div className="space-y-2.5" role="list" aria-label="Answer options">
          {currentQuestion.options.map((option, index) => {
            const status = getOptionStatus(option);
            const isDisabled = isAnswerRevealed;
            const optionLabel = ["A", "B", "C", "D"][index];

            return (
              <button
                key={option}
                onClick={() => selectAnswer(option)}
                disabled={isDisabled}
                role="listitem"
                aria-label={`Option ${optionLabel}: ${option}`}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border font-medium text-sm flex items-center gap-3 transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed"
                )}
                style={{
                  background:
                    status === "correct"
                      ? "var(--color-correct-light)"
                      : status === "incorrect"
                        ? "var(--color-incorrect-light)"
                        : "var(--color-surface-raised)",
                  borderColor:
                    status === "correct"
                      ? "var(--color-correct)"
                      : status === "incorrect"
                        ? "var(--color-incorrect)"
                        : "var(--color-border)",
                  color:
                    status === "correct"
                      ? "var(--color-correct)"
                      : status === "incorrect"
                        ? "var(--color-incorrect)"
                        : "var(--color-text-secondary)",
                  opacity: isDisabled && status === "idle" ? 0.5 : 1,
                }}
              >
                <span
                  className={cn(
                    "shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold",
                    status === "correct" && "bg-correct text-white",
                    status === "incorrect" && "bg-incorrect text-white",
                    status === "idle" && "bg-border text-secondary"
                  )}
                >
                  {status === "correct" ? (
                    <Check className="size-3.5" />
                  ) : status === "incorrect" ? (
                    <X className="size-3.5" />
                  ) : (
                    optionLabel
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* — Timeout Message — */}
        {isAnswerRevealed && selectedAnswer === null && (
          <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in bg-timeout-light text-timeout">
            <Clock className="size-4 shrink-0" />
            <span className="font-medium">
              Time&apos;s up! The correct answer is highlighted above.
            </span>
          </div>
        )}

        {/* — Correct Answer Feedback — */}
        {isAnswerRevealed &&
          selectedAnswer !== null &&
          selectedAnswer === currentQuestion.correctAnswer && (
            <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in bg-correct-light text-correct">
              <Check className="size-4 shrink-0" />
              <span className="font-medium">Correct! Well done.</span>
            </div>
          )}

        {/* — Wrong Answer Feedback — */}
        {isAnswerRevealed &&
          selectedAnswer !== null &&
          selectedAnswer !== currentQuestion.correctAnswer && (
            <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in bg-incorrect-light text-incorrect">
              <X className="size-4 shrink-0" />
              <span className="font-medium">
                Not quite. Check the correct answer above.
              </span>
            </div>
          )}
      </Card>

      {/* ── Bottom: Question dots navigation ── */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
          const isCompleted = i < currentQuestionIndex;
          const isCurrent = i === currentQuestionIndex;

          return (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: isCurrent ? "24px" : "8px",
                background: isCurrent
                  ? "var(--color-accent-2)"
                  : isCompleted
                    ? "var(--color-text-tertiary)"
                    : "var(--color-border)",
              }}
              aria-label={
                isCurrent
                  ? `Current question ${i + 1}`
                  : isCompleted
                    ? `Completed question ${i + 1}`
                    : `Upcoming question ${i + 1}`
              }
            />
          );
        })}
      </div>
    </div>
  );
}