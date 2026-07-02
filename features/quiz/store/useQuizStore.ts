/**
 * QUIZ STORE — "Otak" dari seluruh Quiz App
 *
 * Store ini mengelola:
 * 1. State: data apa yang ada sekarang
 * 2. Actions: apa yang bisa terjadi / diubah
 * 3. Side effects: fetch API, simpan leaderboard
 *
 * Prinsip: komponen UI tidak boleh punya logic quiz.
 * Mereka hanya "membaca state" dan "memanggil action".
 * Semua keputusan ada di sini.
 */

import { create } from "zustand";
import type {
  Question,
  QuizStatus,
  UserAnswer,
  LeaderboardEntry,
  TriviaApiResponse,
  RawTriviaQuestion,
} from "@/types/quiz";
import {
  TRIVIA_API_BASE_URL,
  TOTAL_QUESTIONS,
  POINTS_PER_CORRECT,
  ANSWER_FEEDBACK_DELAY,
} from "@/constants/quiz";
import { getLeaderboard, saveToLeaderboard } from "@/lib/leaderboard";

// ─────────────────────────────────────────────
// HELPER: TRANSFORM DATA API → DATA SIAP PAKAI
// ─────────────────────────────────────────────

/**
 * Decode HTML entities dari string.
 * Open Trivia DB mengembalikan teks dengan HTML entities
 * seperti &quot; &amp; &#039; — kita perlu decode ini
 * supaya tampil normal di UI.
 *
 * Cara kerja: kita buat element HTML sementara di memory,
 * set innerHTML-nya (browser otomatis decode entity),
 * lalu ambil textContent-nya yang sudah bersih.
 */
function decodeHtmlEntities(str: string): string {
  if (typeof document === "undefined") return str;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Acak urutan array (Fisher-Yates shuffle algorithm).
 *
 * Kenapa Fisher-Yates, bukan .sort(() => Math.random() - 0.5)?
 * Karena sort random itu mathematically TIDAK merata distribusinya.
 * Fisher-Yates dijamin setiap permutasi punya probabilitas sama.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Transform satu soal mentah dari API menjadi Question siap pakai.
 * Ini implementasi "anti-corruption layer" yang kita desain di types/.
 */
function transformQuestion(raw: RawTriviaQuestion, index: number): Question {
  const allOptions = shuffleArray([
    raw.correct_answer,
    ...raw.incorrect_answers,
  ]);

  return {
    id: `q-${index}-${Date.now()}`,
    question: decodeHtmlEntities(raw.question),
    category: decodeHtmlEntities(raw.category),
    difficulty: raw.difficulty,
    options: allOptions.map(decodeHtmlEntities),
    correctAnswer: decodeHtmlEntities(raw.correct_answer),
  };
}

// ─────────────────────────────────────────────
// STATE & ACTIONS INTERFACE
// ─────────────────────────────────────────────

interface QuizState {
  status: QuizStatus;
  errorMessage: string | null;
  playerName: string;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  score: number;
  timeLeft: number;
  selectedAnswer: string | null;
  isAnswerRevealed: boolean;
  leaderboard: LeaderboardEntry[];
  selectedCategory: number;
  selectedDifficulty: string;
}

interface QuizActions {
  setPlayerName: (name: string) => void;
  setCategory: (categoryId: number) => void;
  setDifficulty: (difficulty: string) => void;
  startQuiz: () => Promise<void>;
  resetQuiz: () => void;
  selectAnswer: (answer: string) => void;
  timeOut: () => void;
  _nextQuestion: () => void;
  _finishQuiz: () => void;
  decrementTimer: () => void;
  resetTimer: () => void;
  loadLeaderboard: () => void;
  showLeaderboard: () => void;
}

type QuizStore = QuizState & QuizActions;

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

/**
 * Dipisah ke variabel tersendiri supaya bisa dipakai
 * saat inisialisasi DAN saat reset — tidak perlu hardcode ulang.
 */
const initialState: QuizState = {
  status: "idle",
  errorMessage: null,
  playerName: "",
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  score: 0,
  timeLeft: 15,
  selectedAnswer: null,
  isAnswerRevealed: false,
  leaderboard: [],
  selectedCategory: 0,
  selectedDifficulty: "",
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  // ── Config ──

  setPlayerName: (name) => set({ playerName: name }),
  setCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  // ── Start Quiz ──

  startQuiz: async () => {
    const { selectedCategory, selectedDifficulty } = get();

    set({ status: "loading", errorMessage: null });

    try {
      const params = new URLSearchParams({
        amount: String(TOTAL_QUESTIONS),
        type: "multiple",
      });

      if (selectedCategory !== 0) {
        params.append("category", String(selectedCategory));
      }
      if (selectedDifficulty) {
        params.append("difficulty", selectedDifficulty);
      }

      const response = await fetch(`${TRIVIA_API_BASE_URL}?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: TriviaApiResponse = await response.json();

      if (data.response_code !== 0) {
        throw new Error(
          "Tidak ada soal untuk kategori/difficulty ini. Coba pilihan lain."
        );
      }

      const questions = data.results.map(transformQuestion);

      set({
        status: "playing",
        questions,
        currentQuestionIndex: 0,
        userAnswers: [],
        score: 0,
        selectedAnswer: null,
        isAnswerRevealed: false,
        timeLeft: 15,
      });
    } catch (err) {
      set({
        status: "error",
        errorMessage:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan. Coba lagi.",
      });
    }
  },

  // ── Select Answer ──

  selectAnswer: (answer) => {
    const {
      questions,
      currentQuestionIndex,
      score,
      userAnswers,
      isAnswerRevealed,
    } = get();

    // Guard: prevent double-click atau klik setelah timer habis
    if (isAnswerRevealed) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    set({
      selectedAnswer: answer,
      isAnswerRevealed: true,
      score: isCorrect ? score + POINTS_PER_CORRECT : score,
      userAnswers: [
        ...userAnswers,
        {
          questionId: currentQuestion.id,
          selectedAnswer: answer,
          isCorrect,
        },
      ],
    });

    setTimeout(() => {
      get()._nextQuestion();
    }, ANSWER_FEEDBACK_DELAY);
  },

  // ── Time Out ──

  timeOut: () => {
    const { questions, currentQuestionIndex, userAnswers, isAnswerRevealed } =
      get();

    if (isAnswerRevealed) return;

    const currentQuestion = questions[currentQuestionIndex];

    set({
      isAnswerRevealed: true,
      selectedAnswer: null,
      userAnswers: [
        ...userAnswers,
        {
          questionId: currentQuestion.id,
          selectedAnswer: null,
          isCorrect: false,
        },
      ],
    });

    setTimeout(() => {
      get()._nextQuestion();
    }, ANSWER_FEEDBACK_DELAY);
  },

  // ── Internal: Next / Finish ──

  _nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    if (isLastQuestion) {
      get()._finishQuiz();
    } else {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        selectedAnswer: null,
        isAnswerRevealed: false,
        timeLeft: 15,
      });
    }
  },

  _finishQuiz: () => {
    const { playerName, score, questions } = get();

    const updatedLeaderboard = saveToLeaderboard({
      playerName: playerName || "Anonymous",
      score,
      totalQuestions: questions.length,
    });

    set({
      status: "finished",
      leaderboard: updatedLeaderboard,
    });
  },

  // ── Timer ──

  decrementTimer: () => {
    const { timeLeft } = get();
    if (timeLeft <= 0) return;
    set({ timeLeft: timeLeft - 1 });
  },

  resetTimer: () => set({ timeLeft: 15 }),

  // ── Leaderboard ──

  loadLeaderboard: () => {
    set({ leaderboard: getLeaderboard() });
  },

  showLeaderboard: () => set({ status: "leaderboard" }),

  // ── Reset ──

  resetQuiz: () => {
    const { leaderboard } = get();
    // Spread initialState tapi pertahankan leaderboard yang sudah ada
    set({ ...initialState, leaderboard });
  },
}));