"use client";

/**
 * LeaderboardScreen — Tampilan ranking semua pemain.
 *
 * Data dibaca dari Zustand store (yang sudah load dari localStorage).
 * Komponen ini pure display — tidak ada logic, tidak ada side effect.
 */

import { useQuizStore } from "../store/useQuizStore";
import { TOTAL_QUESTIONS, POINTS_PER_CORRECT } from "@/constants/quiz";

export function LeaderboardScreen() {
  const leaderboard = useQuizStore((s) => s.leaderboard);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const maxScore = TOTAL_QUESTIONS * POINTS_PER_CORRECT;

  /**
   * Format tanggal dari ISO string ke tampilan yang readable.
   * Contoh: "2026-07-01T10:00:00.000Z" → "Jul 1, 2026"
   *
   * Kenapa tidak pakai library seperti date-fns?
   * Karena Intl.DateTimeFormat adalah native browser API
   * yang sudah cukup untuk kebutuhan sederhana ini.
   * Tidak perlu tambah dependency.
   */
  const formatDate = (isoString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoString));
  };

  /** Medal emoji untuk top 3 */
  const getMedal = (index: number): string => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[index] ?? `${index + 1}`;
  };

  /** Warna rank badge untuk top 3 */
  const getRankStyle = (index: number) => {
    if (index === 0)
      return {
        background: "#fef9e7",
        color: "#d4a017",
        border: "1px solid #f0d060",
      };
    if (index === 1)
      return {
        background: "#f4f4f5",
        color: "#71717a",
        border: "1px solid #d4d4d8",
      };
    if (index === 2)
      return {
        background: "#fff4ee",
        color: "#c2692a",
        border: "1px solid #f0b090",
      };
    return {
      background: "var(--color-surface-raised)",
      color: "var(--color-text-tertiary)",
      border: "1px solid var(--color-border)",
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          🏆 Leaderboard
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Top {leaderboard.length} scores on this device
        </p>
      </div>

      {/* ── List ── */}
      {leaderboard.length === 0 ? (
        // Empty state
        <div
          className="card-padded text-center space-y-3 py-12"
        >
          <div className="text-4xl">🎯</div>
          <div>
            <p
              className="font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              No scores yet
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Complete a quiz to appear here!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const percentage = Math.round((entry.score / maxScore) * 100);
            const rankStyle = getRankStyle(index);

            return (
              <div
                key={entry.id}
                className="card flex items-center gap-4 px-4 py-3.5 transition-all"
                style={{
                  /**
                   * Top 3 punya border kiri berwarna —
                   * subtle visual distinction untuk juara.
                   */
                  borderLeft:
                    index < 3
                      ? `3px solid ${
                          index === 0
                            ? "#d4a017"
                            : index === 1
                              ? "#71717a"
                              : "#c2692a"
                        }`
                      : "1px solid var(--color-border)",
                }}
              >
                {/* Rank badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={rankStyle}
                >
                  {getMedal(index)}
                </div>

                {/* Nama + tanggal */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {entry.playerName}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {formatDate(entry.playedAt)}
                  </p>
                </div>

                {/* Score + percentage */}
                <div className="text-right shrink-0">
                  <p
                    className="font-bold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {entry.score}{" "}
                    <span
                      className="font-normal text-xs"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      pts
                    </span>
                  </p>
                  <p
                    className="text-xs font-medium mt-0.5"
                    style={{
                      color:
                        percentage >= 80
                          ? "var(--color-correct)"
                          : percentage >= 50
                            ? "var(--color-timeout)"
                            : "var(--color-incorrect)",
                    }}
                  >
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Back Button ── */}
      <button
        onClick={resetQuiz}
        className="w-full py-3 rounded-xl font-medium text-sm transition-all"
        style={{
          background: "var(--color-surface-raised)",
          color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget).style.background = "var(--color-border)";
          (e.currentTarget).style.color = "var(--color-text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget).style.background = "var(--color-surface-raised)";
          (e.currentTarget).style.color = "var(--color-text-secondary)";
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}