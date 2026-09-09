"use client";

import { useQuizStore } from "../store/useQuizStore";
import { TOTAL_QUESTIONS, POINTS_PER_CORRECT } from "@/constants/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Star,
  ThumbsUp,
  BookOpen,
  Dumbbell,
  Medal,
  Check,
  X,
  Clock,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ResultScreen() {
  const score = useQuizStore((s) => s.score);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const questions = useQuizStore((s) => s.questions);
  const playerName = useQuizStore((s) => s.playerName);
  const leaderboard = useQuizStore((s) => s.leaderboard);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const skippedCount = userAnswers.filter((a) => a.selectedAnswer === null).length;
  const incorrectCount = userAnswers.filter(
    (a) => !a.isCorrect && a.selectedAnswer !== null
  ).length;

  const maxScore = TOTAL_QUESTIONS * POINTS_PER_CORRECT;
  const percentage = Math.round((score / maxScore) * 100);

const getPerformance = (): {
    Icon: LucideIcon;
    title: string;
    sub: string;
  } =>  {
    if (percentage === 100)
      return { Icon: Trophy, title: "Perfect Score!", sub: "Absolutely flawless. You're a trivia master." };
    if (percentage >= 80)
      return { Icon: Star, title: "Excellent!", sub: "Outstanding performance. You really know your stuff." };
    if (percentage >= 60)
      return { Icon: ThumbsUp, title: "Good Job!", sub: "Solid effort. A few more sessions and you'll ace it." };
    if (percentage >= 40)
      return { Icon: BookOpen, title: "Keep Practicing", sub: "Not bad for a start. Knowledge grows with repetition." };
    return { Icon: Dumbbell, title: "Room to Grow", sub: "Every expert was once a beginner. Try again!" };
  };

  const performance = getPerformance();
  const PerformanceIcon = performance.Icon;

  const nameToFind = playerName || "Anonymous";
  const leaderboardPosition = leaderboard.findIndex(
    (e) => e.playerName === nameToFind && e.score === score
  );
  const rank = leaderboardPosition !== -1 ? leaderboardPosition + 1 : null;

  const reviewData = userAnswers.map((answer) => ({
    answer,
    question: questions.find((q) => q.id === answer.questionId),
  }));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Hero Card ── */}
      <Card className="rounded-2xl p-6 text-center space-y-5 shadow-md">
        <PerformanceIcon
          className="size-12 mx-auto"
          style={{ color: "var(--color-accent-2)" }}
        />
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-text-primary">
            {performance.title}
          </h2>
          <p className="text-sm text-secondary">{performance.sub}</p>
        </div>

        {/* Score box */}
        <div className="rounded-xl py-5 px-6 bg-surface-raised">
          <div className="font-heading text-6xl font-bold tracking-tight text-accent-2">
            {score}
          </div>
          <div className="text-xs mt-1 font-medium text-tertiary">
            out of {maxScore} points
          </div>
        </div>

        {/* Rank badge */}
        {rank && (
          <div className="rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold bg-accent-2-light text-accent-2">
            <Medal className="size-4" />
            <span>
              {rank === 1
                ? "You're #1 on the leaderboard!"
                : `Ranked #${rank} on the leaderboard`}
            </span>
          </div>
        )}
      </Card>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: correctCount, label: "Correct", color: "var(--color-correct)" },
          { count: incorrectCount, label: "Incorrect", color: "var(--color-incorrect)" },
          { count: skippedCount, label: "Skipped", color: "var(--color-timeout)" },
        ].map(({ count, label, color }) => (
          <Card key={label} className="rounded-xl py-4 text-center shadow-sm">
            <div className="text-2xl font-bold" style={{ color }}>
              {count}
            </div>
            <div className="text-xs mt-0.5 font-medium text-tertiary">{label}</div>
          </Card>
        ))}
      </div>

      {/* ── Accuracy Bar ── */}
      <Card className="rounded-xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">Accuracy</span>
          <span className="text-sm font-bold text-text-primary">{percentage}%</span>
        </div>
        <Progress
          value={percentage}
          className={cn(
            "[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-surface-raised [&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-1000",
            percentage >= 80
              ? "[&_[data-slot=progress-indicator]]:bg-correct"
              : percentage >= 50
                ? "[&_[data-slot=progress-indicator]]:bg-timeout"
                : "[&_[data-slot=progress-indicator]]:bg-incorrect"
          )}
        />
        <p className="text-xs text-tertiary">
          {correctCount} correct · {incorrectCount} incorrect · {skippedCount} timed out
        </p>
      </Card>

      {/* ── Answer Review ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm font-semibold text-text-primary">Answer Review</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          {reviewData.map(({ answer, question }, index) => {
            if (!question) return null;

            const isCorrect = answer.isCorrect;
            const isTimeout = answer.selectedAnswer === null;

            const cfg = isCorrect
              ? {
                  label: "Correct",
                  Icon: Check,
                  headerBg: "var(--color-correct-light)",
                  borderColor: "var(--color-correct)",
                  labelColor: "var(--color-correct)",
                }
              : isTimeout
                ? {
                    label: "Timed out",
                    Icon: Clock,
                    headerBg: "var(--color-timeout-light)",
                    borderColor: "var(--color-timeout)",
                    labelColor: "var(--color-timeout)",
                  }
                : {
                    label: "Incorrect",
                    Icon: X,
                    headerBg: "var(--color-incorrect-light)",
                    borderColor: "var(--color-incorrect)",
                    labelColor: "var(--color-incorrect)",
                  };

            return (
              <Card
                key={answer.questionId}
                className="rounded-lg overflow-hidden shadow-sm p-0 gap-0"
                style={{ borderLeft: `4px solid ${cfg.borderColor}` }}
              >
                {/* Card header — status row */}
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ background: cfg.headerBg }}
                >
                  <span className="text-xs font-medium text-tertiary">Q{index + 1}</span>
                  <span
                    className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                    style={{ color: cfg.labelColor }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0"
                      style={{ background: cfg.labelColor }}
                    >
                      <cfg.Icon className="size-2.5" />
                    </span>
                    {cfg.label}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 space-y-2.5">
                  <p className="text-sm font-medium leading-snug text-text-primary">
                    {question.question}
                  </p>

                  <div className="rounded-lg px-3 py-2.5 space-y-1.5 text-xs bg-surface-raised">
                    <div className="flex items-center gap-2">
                      <span className="font-medium shrink-0 text-tertiary">Correct</span>
                      <span className="font-semibold" style={{ color: "var(--color-correct)" }}>
                        {question.correctAnswer}
                      </span>
                    </div>

                    {!isCorrect && !isTimeout && answer.selectedAnswer && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium shrink-0 text-tertiary">Yours</span>
                        <span className="font-semibold" style={{ color: "var(--color-incorrect)" }}>
                          {answer.selectedAnswer}
                        </span>
                      </div>
                    )}

                    {isTimeout && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium shrink-0 text-tertiary">Yours</span>
                        <span className="italic" style={{ color: "var(--color-timeout)" }}>
                          No answer — timed out
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Play Again Button ── */}
      <Button
        onClick={resetQuiz}
        size="lg"
        className="w-full py-6 rounded-xl font-semibold text-sm mt-2 shadow-md hover:-translate-y-0.5 transition-all"
        style={{ background: "var(--color-accent-2)", color: "#ffffff" }}
      >
        <RotateCcw className="size-4" />
        Play Again
      </Button>
    </div>
  );
}