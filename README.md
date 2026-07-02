# 🧠 QuizMind — Interactive Quiz App

> Day 11 of 100 Days, 100 Web Apps Challenge

A clean, minimal quiz app with real trivia questions, per-question timer, and local leaderboard — built with Next.js App Router, TypeScript, Tailwind CSS v4, and Zustand.

---

## ✨ Features

- **10 Questions per session** — fetched live from Open Trivia DB API
- **15-second timer per question** — circular progress ring with urgency colors
- **Category & difficulty selector** — 8 categories, 3 difficulty levels
- **Answer feedback** — instant visual feedback (correct / incorrect / timed out)
- **Answer review** — full breakdown of every question after the quiz
- **Leaderboard** — top 10 scores saved to localStorage, persists across sessions
- **Minimal clean UI** — Apple-inspired design with whitespace, smooth transitions

---

## 🛠️ Tech Stack

| Tech | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Zustand | Global state management |
| Open Trivia DB | Free trivia API |

---

## 📁 Folder Structure

```
day-11-quiz-app/
├── app/
│   ├── globals.css          # Design tokens, base styles
│   ├── layout.tsx           # Root layout, font setup
│   └── page.tsx             # Entry point
│
├── features/
│   └── quiz/
│       ├── components/
│       │   ├── QuizApp.tsx          # Orchestrator / conductor
│       │   ├── StartScreen.tsx      # Name input, category, difficulty
│       │   ├── QuizScreen.tsx       # Active quiz UI
│       │   ├── Timer.tsx            # Circular countdown timer
│       │   ├── ResultScreen.tsx     # Score + answer review
│       │   └── LeaderboardScreen.tsx
│       ├── hooks/
│       │   └── useTimer.ts          # Timer logic (setInterval + cleanup)
│       └── store/
│           └── useQuizStore.ts      # Zustand store — all state & actions
│
├── lib/
│   └── leaderboard.ts       # localStorage abstraction layer
│
├── types/
│   └── quiz.ts              # TypeScript interfaces
│
└── constants/
    └── quiz.ts              # Timer duration, API config, categories
```

---

## 🏗️ Architecture Decisions

**Why Zustand over useState?**
The quiz has interconnected state (current question, score, timer, answers) that multiple components need to read. Zustand eliminates prop drilling and keeps all logic in one place.

**Why a custom `useTimer` hook?**
`setInterval` is a side effect that lives outside React's render cycle. Keeping it in a dedicated hook prevents memory leaks (cleanup on unmount), stale closure bugs, and timer zombies (multiple intervals running simultaneously).

**Why `lib/leaderboard.ts` as a data access layer?**
Abstracting localStorage into one file means: (1) SSR-safe guards in one place, (2) error handling for corrupt data in one place, (3) if we ever migrate to a database, only this file needs to change.

**Why two separate types (`RawTriviaQuestion` vs `Question`)?**
Anti-corruption layer pattern — the messy external API format (HTML entities, split correct/incorrect answers) never leaks into UI components. Transformation happens once at the boundary.

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/USERNAME/day-11-quiz-app.git
cd day-11-quiz-app

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Key Concepts Practiced

- **State machine pattern** — `QuizStatus` union type prevents impossible states
- **Fisher-Yates shuffle** — mathematically fair answer option randomization
- **Stale closure prevention** — timer delegates to Zustand `get()` instead of reading closed-over values
- **SSR-safe localStorage** — `isBrowser()` guard prevents server-side crashes
- **Selective Zustand subscriptions** — components only re-render when their specific slice changes
- **CSS custom properties as design tokens** — single source of truth for all visual values

---

## 📸 Preview

| Start Screen | Quiz Screen | Result Screen |
|---|---|---|
| Category & difficulty picker | Circular timer + answer options | Score, stats, answer review |

---

## 🔮 Version 2.0 Ideas

- [ ] User accounts with server-side leaderboard (Supabase)
- [ ] Animated score counter on result screen
- [ ] Sound effects (correct / wrong / timer warning)
- [ ] Dark mode toggle
- [ ] Quiz history with session replay
- [ ] Multiplayer mode via WebSockets
- [ ] Bonus points for fast answers

---

## 👤 Author

**Mucaru**
- 100 Days Challenge: Building 100 professional web apps with Next.js
- Day 11 / 100

---

*Trivia data powered by [Open Trivia DB](https://opentdb.com) — free, no API key required.*