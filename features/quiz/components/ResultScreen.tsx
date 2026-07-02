"use client";

import { useQuizStore } from "../store/useQuizStore";
import { TOTAL_QUESTIONS, POINTS_PER_CORRECT } from "@/constants/quiz";

export function ResultScreen() {
  const score = useQuizStore((s) => s.score);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const questions = useQuizStore((s) => s.questions);
  const playerName = useQuizStore((s) => s.playerName);
  const leaderboard = useQuizStore((s) => s.leaderboard);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const skippedCount = userAnswers.filter((a) => a.selectedAnswer === null).length;
  const incorrectCount = userAnswers.filter((a) => !a.isCorrect && a.selectedAnswer !== null).length;

  const maxScore = TOTAL_QUESTIONS * POINTS_PER_CORRECT;
  const percentage = Math.round((score / maxScore) * 100);

  const getPerformanceMessage = () => {
    if (percentage === 100) return { emoji: "🏆", title: "Perfect Score!", sub: "Absolutely flawless. You're a trivia master." };
    if (percentage >= 80)  return { emoji: "🌟", title: "Excellent!",      sub: "Outstanding performance. You really know your stuff." };
    if (percentage >= 60)  return { emoji: "👍", title: "Good Job!",       sub: "Solid effort. A few more sessions and you'll ace it." };
    if (percentage >= 40)  return { emoji: "📚", title: "Keep Practicing", sub: "Not bad for a start. Knowledge grows with repetition." };
    return                        { emoji: "💪", title: "Room to Grow",    sub: "Every expert was once a beginner. Try again!" };
  };

  const performance = getPerformanceMessage();

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
      <div
        className="rounded-2xl p-6 text-center space-y-5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="text-5xl">{performance.emoji}</div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            {performance.title}
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {performance.sub}
          </p>
        </div>

        {/* Score box */}
        <div
          className="rounded-xl py-5 px-6"
          style={{ background: "var(--color-surface-raised)" }}
        >
          <div className="text-6xl font-bold tracking-tight" style={{ color: "var(--color-accent)" }}>
            {score}
          </div>
          <div className="text-xs mt-1 font-medium" style={{ color: "var(--color-text-tertiary)" }}>
            out of {maxScore} points
          </div>
        </div>

        {/* Rank badge */}
        {rank && (
          <div
            className="rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold"
            style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}
          >
            <span>🏅</span>
            <span>{rank === 1 ? "You're #1 on the leaderboard!" : `Ranked #${rank} on the leaderboard`}</span>
          </div>
        )}
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: correctCount,   label: "Correct",   color: "var(--color-correct)" },
          { count: incorrectCount, label: "Incorrect", color: "var(--color-incorrect)" },
          { count: skippedCount,   label: "Skipped",   color: "var(--color-timeout)" },
        ].map(({ count, label, color }) => (
          <div
            key={label}
            className="rounded-xl py-4 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="text-2xl font-bold" style={{ color }}>{count}</div>
            <div className="text-xs mt-0.5 font-medium" style={{ color: "var(--color-text-tertiary)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Accuracy Bar ── */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Accuracy</span>
          <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{percentage}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-raised)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${percentage}%`,
              background: percentage >= 80 ? "var(--color-correct)" : percentage >= 50 ? "var(--color-timeout)" : "var(--color-incorrect)",
            }}
          />
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {correctCount} correct · {incorrectCount} incorrect · {skippedCount} timed out
        </p>
      </div>

      {/* ── Answer Review ── */}
      <div className="space-y-3">
        {/* Section label */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Answer Review
          </span>
          <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
        </div>

        <div className="review-list">
        {reviewData.map(({ answer, question }, index) => {
          if (!question) return null;

          const isCorrect = answer.isCorrect;
          const isTimeout = answer.selectedAnswer === null;

          // Config visual per status
          const cfg = isCorrect
            ? { label: "Correct",   dot: "✓", headerBg: "#f0fdf4", borderColor: "#22c55e", labelColor: "#16a34a", dotBg: "#22c55e" }
            : isTimeout
            ? { label: "Timed out", dot: "⏱", headerBg: "#fffbeb", borderColor: "#f59e0b", labelColor: "#d97706", dotBg: "#f59e0b" }
            : { label: "Incorrect", dot: "✗", headerBg: "#fff1f2", borderColor: "#f43f5e", labelColor: "#e11d48", dotBg: "#f43f5e" };

          return (
                <div
                key={answer.questionId}
                className={`review-card review-card-${isCorrect ? 'correct' : isTimeout ? 'timeout' : 'incorrect'}`}
                >
              {/* Card header — status row */}
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ background: cfg.headerBg }}
              >
                {/* Nomor soal — kiri */}
                <span className="text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>
                  Q{index + 1}
                </span>

                {/* Status badge — kanan, tidak overflow */}
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                  style={{ color: cfg.labelColor }}
                >
                  {/* Dot icon */}
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white shrink-0"
                    style={{ background: cfg.dotBg, fontSize: "9px" }}
                  >
                    {cfg.dot}
                  </span>
                  {cfg.label}
                </span>
              </div>

              {/* Card body */}
              <div className="px-4 py-3 space-y-2.5">
                {/* Teks soal */}
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text-primary)" }}>
                  {question.question}
                </p>

                {/* Jawaban */}
                <div
                  className="rounded-lg px-3 py-2.5 space-y-1.5 text-xs"
                  style={{ background: "var(--color-surface-raised)" }}
                >
                  {/* Jawaban benar — selalu tampil */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium shrink-0" style={{ color: "var(--color-text-tertiary)" }}>Correct</span>
                    <span className="font-semibold" style={{ color: "#16a34a" }}>{question.correctAnswer}</span>
                  </div>

                  {/* Jawaban salah user */}
                  {!isCorrect && !isTimeout && answer.selectedAnswer && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium shrink-0" style={{ color: "var(--color-text-tertiary)" }}>Yours</span>
                      <span className="font-semibold" style={{ color: "#e11d48" }}>{answer.selectedAnswer}</span>
                    </div>
                  )}

                  {/* Timeout */}
                  {isTimeout && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium shrink-0" style={{ color: "var(--color-text-tertiary)" }}>Yours</span>
                      <span className="italic" style={{ color: "#d97706" }}>No answer — timed out</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* ── Play Again Button ── */}
      <button
        onClick={resetQuiz}
        className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-2"
        style={{
          background: "var(--color-accent)",
          boxShadow: "0 2px 12px rgba(0,113,227,0.3)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget).style.background = "var(--color-accent-hover)";
          (e.currentTarget).style.transform = "translateY(-1px)";
          (e.currentTarget).style.boxShadow = "0 4px 16px rgba(0,113,227,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget).style.background = "var(--color-accent)";
          (e.currentTarget).style.transform = "translateY(0)";
          (e.currentTarget).style.boxShadow = "0 2px 12px rgba(0,113,227,0.3)";
        }}
      >
        Play Again →
      </button>
    </div>
  );
}