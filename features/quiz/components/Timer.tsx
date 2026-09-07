"use client";

/**
 * Timer — Circular Progress Ring
 *
 * Pure UI component: tidak ada logic, tidak ada state lokal.
 * Ini tetap custom SVG (bukan shadcn) karena shadcn tidak
 * menyediakan circular countdown timer sebagai primitive.
 */

import { useQuizStore } from "../store/useQuizStore";
import { TIMER_DURATION } from "@/constants/quiz";
import { cn } from "@/lib/utils";

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Timer() {
  const timeLeft = useQuizStore((s) => s.timeLeft);
  const isAnswerRevealed = useQuizStore((s) => s.isAnswerRevealed);

  const progress = 1 - timeLeft / TIMER_DURATION;
  const strokeDashoffset = CIRCUMFERENCE * progress;

  const getColor = () => {
    const ratio = timeLeft / TIMER_DURATION;
    if (ratio > 0.6) return "var(--color-accent)";
    if (ratio > 0.3) return "var(--color-timeout)";
    return "var(--color-incorrect)";
  };

  const color = getColor();
  const isUrgent = timeLeft <= 5 && !isAnswerRevealed;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="88"
        height="88"
        viewBox="0 0 100 100"
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-bold tabular-nums transition-all duration-300",
            isUrgent ? "text-[1.35rem]" : "text-[1.15rem]"
          )}
          style={{ color }}
          aria-live="polite"
          aria-label={`${timeLeft} seconds remaining`}
        >
          {timeLeft}
        </span>
      </div>

      {isUrgent && (
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{
            border: `2px solid ${color}`,
            animation: "pulse-ring 1s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}