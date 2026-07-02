/**
 * QUIZ CONSTANTS
 *
 * Semua nilai konfigurasi quiz dikumpulkan di sini.
 * Tidak ada "angka misterius" yang nyebar di seluruh kodebase.
 *
 * Aturan: kalau kamu nulis angka atau string konfigurasi
 * lebih dari sekali di tempat berbeda → pindahkan ke sini.
 */

// ─────────────────────────────────────────────
// GAME RULES
// ─────────────────────────────────────────────

/** Durasi timer per soal dalam detik */
export const TIMER_DURATION = 15;

/** Jumlah soal yang di-fetch dari API per sesi quiz */
export const TOTAL_QUESTIONS = 10;

/**
 * Poin per jawaban benar.
 * Kenapa ada konstanta ini? Karena mungkin besok kamu mau
 * bikin sistem poin berbeda berdasarkan difficulty
 * (easy=10, medium=20, hard=30) — dengan konstanta,
 * refactor ini jauh lebih mudah.
 */
export const POINTS_PER_CORRECT = 10;

/**
 * Bonus poin kalau jawab benar dengan sisa waktu banyak.
 * Fitur ini opsional sekarang, tapi dengan mendefinisikan
 * konstantanya dari awal, kita "membuka pintu" untuk
 * implementasi di masa depan tanpa refactor besar.
 */
export const BONUS_POINTS_PER_SECOND = 0; // set 0 untuk disable sementara

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────

/** Key yang dipakai di localStorage untuk menyimpan leaderboard */
export const LEADERBOARD_STORAGE_KEY = "quiz-app-leaderboard";

/** Maksimal entry yang ditampilkan di leaderboard */
export const MAX_LEADERBOARD_ENTRIES = 10;

// ─────────────────────────────────────────────
// OPEN TRIVIA DB API
// ─────────────────────────────────────────────

/** Base URL Open Trivia DB */
export const TRIVIA_API_BASE_URL = "https://opentdb.com/api.php";

/**
 * Kategori soal yang tersedia.
 * Nilai `id` mengikuti kategori ID dari Open Trivia DB.
 * Referensi: https://opentdb.com/api_category.php
 *
 * Kenapa kita bikin array of object seperti ini, bukan
 * sekadar object biasa { "General": 9, "Science": 17 }?
 * Karena array of object lebih gampang di-map ke elemen
 * UI (dropdown, button list) secara langsung.
 */
export const QUIZ_CATEGORIES = [
  { id: 0, label: "🎲 Random Mix" },
  { id: 9, label: "🌍 General Knowledge" },
  { id: 17, label: "🔬 Science & Nature" },
  { id: 23, label: "🏛️ History" },
  { id: 21, label: "🏅 Sports" },
  { id: 11, label: "🎬 Film" },
  { id: 15, label: "🎮 Video Games" },
  { id: 18, label: "💻 Computers" },
] as const;
/**
 * `as const` di sini membuat TypeScript memperlakukan array ini
 * sebagai "readonly tuple" dengan tipe yang sangat spesifik.
 * Artinya: TypeScript tahu bahwa id HANYA bisa berupa
 * 0 | 9 | 17 | 23 | 21 | 11 | 15 | 18 — bukan sembarang number.
 * Ini mencegah bug subtle seperti salah input category id.
 */

/** Difficulty level yang tersedia */
export const QUIZ_DIFFICULTIES = [
  { value: "", label: "🎰 Any Difficulty" },
  { value: "easy", label: "🟢 Easy" },
  { value: "medium", label: "🟡 Medium" },
  { value: "hard", label: "🔴 Hard" },
] as const;

// ─────────────────────────────────────────────
// UI / ANIMATION
// ─────────────────────────────────────────────

/**
 * Durasi jeda (ms) setelah user memilih jawaban sebelum
 * pindah ke soal berikutnya. Ini memberikan visual feedback
 * "benar/salah" yang bisa dilihat user sebelum soal berganti.
 */
export const ANSWER_FEEDBACK_DELAY = 1000;

/**
 * Warna untuk feedback jawaban.
 * Disimpan di sini (bukan inline di component) karena
 * dipakai di lebih dari satu tempat (QuestionCard + Timer).
 */
export const FEEDBACK_COLORS = {
  correct: "emerald",
  incorrect: "red",
  timeout: "amber",
} as const;