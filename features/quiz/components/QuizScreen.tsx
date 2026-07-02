"use client";

/**
 * QuizScreen — Layar utama saat quiz berlangsung.
 *
 * Komponen ini adalah "stage" tempat drama quiz terjadi.
 * Dia mengatur layout keseluruhan dan mendelegasikan
 * detail ke sub-komponen yang lebih kecil.
 *
 * Hierarki komponen di layar ini:
 *
 * QuizScreen
 * ├── Progress Bar (soal ke-N dari total)
 * ├── Header Row
 * │   ├── Category + Difficulty badge
 * │   └── Timer (circular)
 * ├── Question Card
 * │   ├── Teks soal
 * │   └── Answer Options (grid of buttons)
 * └── Score tracker
 */

import { useQuizStore } from "../store/useQuizStore";
import { useTimer } from "../hooks/useTimer";
import { Timer } from "./Timer";
import { TOTAL_QUESTIONS } from "@/constants/quiz";

export function QuizScreen() {
  /**
   * Aktifkan timer. Hook ini tidak return apa-apa —
   * dia hanya menjalankan side effect (setInterval)
   * dan berinteraksi langsung dengan store.
   * Cukup dipanggil di sini, timer langsung jalan.
   */
  useTimer();

  const questions = useQuizStore((s) => s.questions);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const score = useQuizStore((s) => s.score);
  const selectedAnswer = useQuizStore((s) => s.selectedAnswer);
  const isAnswerRevealed = useQuizStore((s) => s.isAnswerRevealed);
  const selectAnswer = useQuizStore((s) => s.selectAnswer);

  const currentQuestion = questions[currentQuestionIndex];

  // Guard: kalau soal belum ada (edge case), jangan render
  if (!currentQuestion) return null;

  const questionNumber = currentQuestionIndex + 1;

  /**
   * Tentukan status visual setiap option button.
   * Ini dipanggil per option saat render.
   *
   * Logika:
   * - Belum ada jawaban dipilih → semua "idle"
   * - Sudah ada jawaban:
   *   - Option yang benar → "correct" (selalu hijau)
   *   - Option yang dipilih user dan salah → "incorrect"
   *   - Option lain → "idle" (pudar/disabled)
   */
  const getOptionStatus = (
    option: string
  ): "idle" | "correct" | "incorrect" | "timeout" => {
    if (!isAnswerRevealed) return "idle";

    if (option === currentQuestion.correctAnswer) return "correct";

    // Kalau selectedAnswer null = timer habis, tidak ada yang dipilih
    if (selectedAnswer === null) return "idle";

    if (option === selectedAnswer) return "incorrect";

    return "idle";
  };

  /**
   * Style tiap option berdasarkan statusnya.
   * Dikembalikan sebagai object supaya bisa dipakai
   * di style prop dan className sekaligus.
   */
  const getOptionStyle = (status: ReturnType<typeof getOptionStatus>) => {
    // BARU
    const base = {
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    switch (status) {
      case "correct":
        return {
          ...base,
          background: "var(--color-correct-light)",
          borderColor: "var(--color-correct)",
          color: "var(--color-correct)",
        };
      case "incorrect":
        return {
          ...base,
          background: "var(--color-incorrect-light)",
          borderColor: "var(--color-incorrect)",
          color: "var(--color-incorrect)",
        };
      default:
        return {
          ...base,
          background: "var(--color-surface-raised)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        };
    }
  };

  /**
   * Progress bar percentage.
   * Kita hitung soal yang SUDAH selesai, bukan yang sedang dikerjakan.
   * Jadi soal pertama = 0%, soal terakhir selesai = 100%.
   */
  const progressPercent = (currentQuestionIndex / TOTAL_QUESTIONS) * 100;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Progress Bar ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Question {questionNumber} of {TOTAL_QUESTIONS}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--color-accent)" }}
          >
            {score} pts
          </span>
        </div>

        {/* Track */}
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--color-border)" }}
        >
          {/* Fill */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPercent}%`,
              background: "var(--color-accent)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <div
        /**
         * key={currentQuestion.id} di sini sangat penting.
         * Dengan key yang berubah setiap soal berganti,
         * React akan DESTROY komponen lama dan CREATE yang baru —
         * bukan update komponen yang sama.
         * Efeknya: animasi fade-in jalan ulang setiap soal baru muncul.
         * Tanpa key: komponen yang sama di-update, animasi tidak jalan.
         */
        key={currentQuestion.id}
        className="card-padded space-y-6 animate-fade-in-scale"
      >

        {/* — Header: Category, Difficulty, Timer — */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {currentQuestion.category}
            </p>
            {/* Difficulty badge */}
            <span className={`badge badge-${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty === "easy" && "🟢"}
              {currentQuestion.difficulty === "medium" && "🟡"}
              {currentQuestion.difficulty === "hard" && "🔴"}
              {" "}{currentQuestion.difficulty}
            </span>
          </div>

          {/* Timer di pojok kanan */}
          <Timer />
        </div>

        {/* — Teks Soal — */}
        <div>
          <h2
            className="text-lg font-semibold leading-snug"
            style={{
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {currentQuestion.question}
          </h2>
        </div>

        {/* — Answer Options — */}
        <div className="space-y-2.5" role="list" aria-label="Answer options">
          {currentQuestion.options.map((option, index) => {
            const status = getOptionStatus(option);
            const optionStyle = getOptionStyle(status);
            const isDisabled = isAnswerRevealed;

            /**
             * Label huruf untuk setiap option: A, B, C, D
             * Ini membantu orientasi user — lebih mudah
             * mengingat "saya pilih C" daripada mengingat teks panjang.
             */
            const optionLabel = ["A", "B", "C", "D"][index];

            return (
              <button
                key={option}
                onClick={() => selectAnswer(option)}
                disabled={isDisabled}
                role="listitem"
                className="w-full text-left px-4 py-3.5 rounded-xl border font-medium text-sm flex items-center gap-3 disabled:cursor-not-allowed active:scale-[0.99]"
                style={{
                  ...optionStyle,
                  opacity: isDisabled && status === "idle" ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--color-accent)";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-accent-light)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--color-accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) {
                    const s = getOptionStyle(getOptionStatus(option));
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      s.borderColor;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      s.background;
                    (e.currentTarget as HTMLButtonElement).style.color =
                      s.color;
                  }
                }}
                aria-label={`Option ${optionLabel}: ${option}`}
              >
                {/* Label huruf */}
                <span
                  className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      status === "correct"
                        ? "var(--color-correct)"
                        : status === "incorrect"
                          ? "var(--color-incorrect)"
                          : "var(--color-border)",
                    color:
                      status === "correct" || status === "incorrect"
                        ? "#ffffff"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {status === "correct"
                    ? "✓"
                    : status === "incorrect"
                      ? "✗"
                      : optionLabel}
                </span>

                {/* Teks option */}
                <span className="flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* — Timeout Message — */}
        {isAnswerRevealed && selectedAnswer === null && (
          <div
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in"
            style={{
              background: "var(--color-timeout-light)",
              color: "var(--color-timeout)",
            }}
          >
            <span>⏱</span>
            <span className="font-medium">
              Time&apos;s up! The correct answer is highlighted above.
            </span>
          </div>
        )}

        {/* — Correct Answer Feedback — */}
        {isAnswerRevealed &&
          selectedAnswer !== null &&
          selectedAnswer === currentQuestion.correctAnswer && (
            <div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in"
              style={{
                background: "var(--color-correct-light)",
                color: "var(--color-correct)",
              }}
            >
              <span>✓</span>
              <span className="font-medium">Correct! Well done.</span>
            </div>
          )}

        {/* — Wrong Answer Feedback — */}
        {isAnswerRevealed &&
          selectedAnswer !== null &&
          selectedAnswer !== currentQuestion.correctAnswer && (
            <div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl animate-fade-in"
              style={{
                background: "var(--color-incorrect-light)",
                color: "var(--color-incorrect)",
              }}
            >
              <span>✗</span>
              <span className="font-medium">
                Not quite. Check the correct answer above.
              </span>
            </div>
          )}
      </div>

      {/* ── Bottom: Question dots navigation ── */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
          const isCompleted = i < currentQuestionIndex;
          const isCurrent = i === currentQuestionIndex;

          return (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: isCurrent ? "24px" : "8px",
                height: "8px",
                background: isCurrent
                  ? "var(--color-accent)"
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