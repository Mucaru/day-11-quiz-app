"use client";

/**
 * LeaderboardScreen — Tampilan ranking semua pemain.
 *
 * Data dibaca dari Zustand store (yang sudah load dari localStorage).
 * Komponen ini pure display — tidak ada logic, tidak ada side effect.
 */

import { useQuizStore } from "../store/useQuizStore";
import { TOTAL_QUESTIONS, POINTS_PER_CORRECT } from "@/constants/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Medal, ArrowLeft } from "lucide-react";

const RANK_STYLES = [
  { bg: "#fef9e7", color: "#d4a017", border: "#f0d060" }, // gold
  { bg: "#f4f4f5", color: "#71717a", border: "#d4d4d8" }, // silver
  { bg: "#fff4ee", color: "#c2692a", border: "#f0b090" }, // bronze
];

export function LeaderboardScreen() {
  const leaderboard = useQuizStore((s) => s.leaderboard);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const maxScore = TOTAL_QUESTIONS * POINTS_PER_CORRECT;

  const formatDate = (isoString: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoString));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-text-primary flex items-center justify-center gap-2">
          <Trophy className="size-6" style={{ color: "var(--color-accent-2)" }} />
          Leaderboard
        </h2>
        <p className="text-sm text-text-secondary">
          Top {leaderboard.length} scores on this device
        </p>
      </div>

      {/* ── List ── */}
      {leaderboard.length === 0 ? (
        <Card className="text-center space-y-3 py-12 rounded-xl shadow-sm">
          <Target className="size-10 mx-auto text-tertiary" />
          <div>
            <p className="font-medium text-text-primary">No scores yet</p>
            <p className="text-sm mt-1 text-text-secondary">
              Complete a quiz to appear here!
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const percentage = Math.round((entry.score / maxScore) * 100);
            const topStyle = RANK_STYLES[index];

            return (
              <Card
                key={entry.id}
                className="flex flex-row items-center gap-4 px-4 py-3.5 rounded-xl shadow-sm"
                style={{
                  borderLeft: topStyle
                    ? `3px solid ${topStyle.border}`
                    : "1px solid var(--color-border)",
                }}
              >
                {/* Rank badge */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={
                    topStyle
                      ? {
                          background: topStyle.bg,
                          color: topStyle.color,
                          border: `1px solid ${topStyle.border}`,
                        }
                      : {
                          background: "var(--color-surface-raised)",
                          color: "var(--color-text-tertiary)",
                          border: "1px solid var(--color-border)",
                        }
                  }
                >
                  {index < 3 ? <Medal className="size-4" /> : index + 1}
                </div>

                {/* Nama + tanggal */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-text-primary">
                    {entry.playerName}
                  </p>
                  <p className="text-xs mt-0.5 text-tertiary">
                    {formatDate(entry.playedAt)}
                  </p>
                </div>

                {/* Score + percentage */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-text-primary">
                    {entry.score}{" "}
                    <span className="font-normal text-xs text-tertiary">pts</span>
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
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Back Button ── */}
      <Button
        onClick={resetQuiz}
        variant="outline"
        className="w-full py-6 rounded-xl font-medium text-sm bg-surface-raised text-text-secondary border-border hover:bg-border hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Button>
    </div>
  );
}