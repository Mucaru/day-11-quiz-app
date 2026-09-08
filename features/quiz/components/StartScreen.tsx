"use client";

import { useQuizStore } from "../store/useQuizStore";
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from "@/constants/quiz";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Trophy,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export function StartScreen() {
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
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1.5 bg-accent-2-light text-accent-2 border-transparent px-3 py-1 rounded-full font-medium"
        >
          <Sparkles className="size-3.5" />
          Day 11 · 100 Days Challenge
        </Badge>

        <h1 className="font-heading font-bold tracking-tight text-text-primary">
          Test Your Knowledge
        </h1>

        <p className="text-sm text-secondary mx-auto max-w-xs sm:max-w-none">
          10 questions &middot; 15 seconds each &middot; Real trivia from Open
          Trivia DB
        </p>

        {topPlayer && (
          <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg mt-1 bg-surface-raised text-secondary">
            <Trophy className="size-4 text-timeout" />
            <span>
              Best:{" "}
              <strong className="text-text-primary">
                {topPlayer.playerName}
              </strong>{" "}
              · {topPlayer.score} pts
            </span>
          </div>
        )}
      </div>

      {/* ── Config Card ── */}
      <Card className="p-4 sm:p-6 space-y-6 shadow-md rounded-xl">
        {/* — Input Nama — */}
        <div className="space-y-2">
          <label
            htmlFor="player-name"
            className="block text-sm font-medium text-text-primary"
          >
            Your Name
          </label>
          <Input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Anonymous"
            maxLength={30}
            disabled={isLoading}
            className="bg-surface-raised border-border rounded-xl h-11 focus-visible:ring-accent-2 focus-visible:border-accent-2"
          />
        </div>

        <Separator />

        {/* — Pilih Kategori — */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">Category</p>
          <div className="grid grid-cols-2 gap-2">
            {QUIZ_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  disabled={isLoading}
                  onClick={() => setCategory(cat.id)}
                  className="justify-start h-auto py-2.5 px-3 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background: isSelected
                      ? "var(--color-accent-2)"
                      : "var(--color-surface-raised)",
                    color: isSelected
                      ? "#ffffff"
                      : "var(--color-text-secondary)",
                    borderColor: isSelected
                      ? "var(--color-accent-2)"
                      : "var(--color-border)",
                    transform: isSelected ? "scale(1.01)" : "scale(1)",
                  }}
                >
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* — Pilih Difficulty — */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">Difficulty</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUIZ_DIFFICULTIES.map((diff) => {
              const isSelected = selectedDifficulty === diff.value;
              return (
                <Button
                  key={diff.value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  disabled={isLoading}
                  onClick={() => setDifficulty(diff.value)}
                  className="h-auto py-2.5 px-3 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background: isSelected
                      ? "var(--color-text-primary)"
                      : "var(--color-surface-raised)",
                    color: isSelected
                      ? "var(--color-bg)"
                      : "var(--color-text-secondary)",
                    borderColor: isSelected
                      ? "var(--color-text-primary)"
                      : "var(--color-border)",
                  }}
                >
                  {diff.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* — Error Message — */}
        {status === "error" && errorMessage && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-fade-in bg-incorrect-light text-incorrect">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* — Start Button — */}
        <Button
          onClick={() => startQuiz()}
          disabled={isLoading}
          size="lg"
          className="w-full py-6 rounded-xl font-semibold text-sm shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0"
          style={{
            background: isLoading
              ? "var(--color-text-tertiary)"
              : "var(--color-accent-2)",
            color: "#ffffff",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Fetching questions...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Start Quiz
              <ArrowRight className="size-4" />
            </span>
          )}
        </Button>
      </Card>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Questions", value: "10" },
          { label: "Timer", value: "15s" },
          { label: "Points", value: "10 / Q" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="text-center py-4 px-2 shadow-sm rounded-xl"
          >
            <div className="font-heading text-xl font-bold tracking-tight text-text-primary">
              {stat.value}
            </div>
            <div className="text-xs mt-0.5 text-tertiary">{stat.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}