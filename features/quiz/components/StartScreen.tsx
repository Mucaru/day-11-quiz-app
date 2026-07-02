"use client";

/**
 * StartScreen — Halaman pertama yang user lihat.
 *
 * Tanggung jawab:
 * 1. Input nama player (opsional, default "Anonymous")
 * 2. Pilih kategori soal
 * 3. Pilih difficulty
 * 4. Trigger start quiz
 * 5. Tampilkan loading state saat fetch soal
 * 6. Tampilkan error state kalau fetch gagal
 *
 * Komponen ini adalah "form" dalam arti luas —
 * tapi kita tidak pakai <form> HTML karena tidak ada
 * submit ke server. Semua interaksi adalah client-side state.
 */

import { useQuizStore } from "../store/useQuizStore";
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from "@/constants/quiz";

export function StartScreen() {
  // Baca hanya field yang dibutuhkan komponen ini.
  // Ini penting untuk performance: komponen hanya re-render
  // kalau field yang dia "subscribe" berubah — bukan semua field store.
  const playerName = useQuizStore((s) => s.playerName);
  const selectedCategory = useQuizStore((s) => s.selectedCategory);
  const selectedDifficulty = useQuizStore((s) => s.selectedDifficulty);
  const status = useQuizStore((s) => s.status);
  const errorMessage = useQuizStore((s) => s.errorMessage);
  const leaderboard = useQuizStore((s) => s.leaderboard);

  const setPlayerName = useQuizStore((s) => s.setPlayerName);
  const setCategory = useQuizStore((s) => s.setCategory);
  const setDifficulty = useQuizStore((s) => s.setDifficulty);
  const startQuiz = useQuizStore((s) => s.startQuiz);

  const isLoading = status === "loading";
  const topPlayer = leaderboard[0];

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Hero Section ── */}
      <div className="text-center space-y-3 pt-4">
        <div
          className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full mb-2"
          style={{
            background: "var(--color-accent-light)",
            color: "var(--color-accent)",
          }}
        >
          <span>✦</span>
          <span>Day 11 · 100 Days Challenge</span>
        </div>

        <h1
          className="font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Test Your Knowledge
        </h1>

        // BARU - nowrap + ukuran lebih kecil
        <p
          className="text-sm mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          10 questions &middot; 15 seconds each &middot; Real trivia from Open Trivia DB
        </p>

        {/* Topline stat: tampilkan top score kalau ada */}
        {topPlayer && (
          <div
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg mt-1"
            style={{
              background: "var(--color-surface-raised)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span>🏆</span>
            <span>
              Best:{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {topPlayer.playerName}
              </strong>{" "}
              · {topPlayer.score} pts
            </span>
          </div>
        )}
      </div>

      {/* ── Config Card ── */}
      <div className="card-padded space-y-6">

        {/* — Input Nama — */}
        <div className="space-y-2">
          <label
            htmlFor="player-name"
            className="block text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Your Name
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Anonymous"
            maxLength={30}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none disabled:opacity-50"
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            }}
            /**
             * onFocus/onBlur untuk visual feedback.
             * Kita tidak bisa pakai Tailwind focus: untuk CSS variables,
             * jadi kita pakai inline style manipulation lewat event handler.
             * Alternatif: bikin custom CSS class di globals.css.
             */
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-accent)";
              e.target.style.boxShadow =
                "0 0 0 3px var(--color-accent-light)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{ background: "var(--color-border)" }}
        />

        {/* — Pilih Kategori — */}
        <div className="space-y-3">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Category
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUIZ_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  disabled={isLoading}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all disabled:opacity-50"
                  style={{
                    background: isSelected
                      ? "var(--color-accent)"
                      : "var(--color-surface-raised)",
                    color: isSelected
                      ? "#ffffff"
                      : "var(--color-text-secondary)",
                    border: `1px solid ${
                      isSelected
                        ? "var(--color-accent)"
                        : "var(--color-border)"
                    }`,
                    transform: isSelected ? "scale(1.01)" : "scale(1)",
                    boxShadow: isSelected
                      ? "0 2px 8px rgba(0, 113, 227, 0.25)"
                      : "none",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{ background: "var(--color-border)" }}
        />

        {/* — Pilih Difficulty — */}
        <div className="space-y-3">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Difficulty
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUIZ_DIFFICULTIES.map((diff) => {
              const isSelected = selectedDifficulty === diff.value;
              return (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value)}
                  disabled={isLoading}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                  style={{
                    background: isSelected
                      ? "var(--color-text-primary)"
                      : "var(--color-surface-raised)",
                    color: isSelected
                      ? "#ffffff"
                      : "var(--color-text-secondary)",
                    border: `1px solid ${
                      isSelected
                        ? "var(--color-text-primary)"
                        : "var(--color-border)"
                    }`,
                  }}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* — Error Message — */}
        {status === "error" && errorMessage && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-fade-in"
            style={{
              background: "var(--color-incorrect-light)",
              color: "var(--color-incorrect)",
            }}
          >
            <span className="mt-0.5 shrink-0">⚠️</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* — Start Button — */}
        <button
          onClick={() => startQuiz()}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
          style={{
            background: isLoading
              ? "var(--color-text-tertiary)"
              : "var(--color-accent)",
            color: "#ffffff",
            boxShadow: isLoading
              ? "none"
              : "0 2px 12px rgba(0, 113, 227, 0.35)",
          }}
          /**
           * Hover effect via JS karena CSS variable tidak bisa
           * diakses langsung di Tailwind hover: untuk custom properties.
           */
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.target as HTMLButtonElement).style.background =
                "var(--color-accent-hover)";
              (e.target as HTMLButtonElement).style.transform =
                "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              (e.target as HTMLButtonElement).style.background =
                "var(--color-accent)";
              (e.target as HTMLButtonElement).style.transform =
                "translateY(0)";
            }
          }}
        >
          {isLoading ? (
            // Loading state: spinner + teks
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Fetching questions...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Start Quiz
              <span className="text-base">→</span>
            </span>
          )}
        </button>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Questions", value: "10" },
          { label: "Timer", value: "15s" },
          { label: "Points", value: "10 / Q" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card text-center py-4 px-2"
          >
            <div
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Komponen kecil: loading spinner.
 * Dipisah ke fungsi tersendiri supaya StartScreen tidak ramai.
 * Karena hanya dipakai di satu file ini, tidak perlu file terpisah.
 *
 * Teknik: animasi spin menggunakan Tailwind animate-spin,
 * bentuknya adalah circle border yang salah satu sisinya transparan.
 */
function LoadingSpinner() {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
      aria-hidden="true"
    />
  );
}