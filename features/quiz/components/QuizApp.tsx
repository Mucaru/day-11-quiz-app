"use client";

import { useEffect } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { StartScreen } from "./StartScreen";
import { QuizScreen } from "./QuizScreen";
import { ResultScreen } from "./ResultScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";

export function QuizApp() {
  const status = useQuizStore((state) => state.status);
  const loadLeaderboard = useQuizStore((state) => state.loadLeaderboard);
  const showLeaderboard = useQuizStore((state) => state.showLeaderboard);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const renderScreen = () => {
    switch (status) {
      case "idle":
      case "loading":
      case "error":
        return <StartScreen />;
      case "playing":
        return <QuizScreen />;
      case "finished":
        return <ResultScreen />;
      case "leaderboard":
        return <LeaderboardScreen />;
      default:
        return <StartScreen />;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="py-5 border-b border-[--color-border]">
        <div className="container-quiz">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "var(--color-accent)" }}
              >
                Q
              </div>
              <span
                className="font-semibold tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                QuizMind
              </span>
            </div>

            {/* Tombol leaderboard — sembunyikan saat quiz berlangsung */}
            {status !== "playing" && (
              <button
                onClick={showLeaderboard}
                className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface-raised)",
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
                🏆 Leaderboard
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container-quiz">{renderScreen()}</div>
      </main>

      <footer className="py-6 border-t border-[--color-border]">
        <div className="container-quiz">
          <p
            className="text-center text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Powered by{" "}
            <a
              href="https://opentdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Open Trivia DB
            </a>{" "}
            · Day 11 of 100
          </p>
        </div>
      </footer>
    </div>
  );
}