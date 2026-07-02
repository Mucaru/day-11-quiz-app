/**
 * Bentuk data MENTAH yang dikembalikan oleh Open Trivia DB API.
 *
 * Kenapa kita bikin type terpisah untuk "raw" vs yang siap pakai?
 * Karena API eksternal itu di luar kontrol kita — formatnya bisa aneh,
 * ada HTML entity, dan jawaban benar/salah masih terpisah-pisah.
 * Kita tidak mau "kekacauan" dari luar ini bocor sampai ke komponen UI.
 */
export interface RawTriviaQuestion {
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

/**
 * Bentuk respons asli dari Open Trivia DB.
 * response_code: 0 berarti sukses, selain itu ada error
 * (misal soal yang diminta tidak tersedia).
 */
export interface TriviaApiResponse {
  response_code: number;
  results: RawTriviaQuestion[];
}

/**
 * Bentuk soal yang SUDAH SIAP dipakai oleh komponen UI.
 *
 * Bedanya dengan RawTriviaQuestion:
 * - HTML entity sudah didekode (&quot; jadi ")
 * - correct_answer dan incorrect_answers sudah digabung jadi satu
 *   array `options` yang urutannya sudah diacak
 * - ada `id` unik supaya gampang dipakai sebagai React key
 *
 * Inilah manfaat punya 2 type terpisah: komponen UI cukup tahu
 * bentuk yang rapi ini saja, tidak perlu tahu sama sekali soal
 * "kekacauan" data mentah dari API.
 */
export interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  options: string[];
  correctAnswer: string;
}

/**
 * Satu entry di leaderboard.
 * Disimpan di localStorage, jadi semua field harus berupa
 * tipe data yang aman di-serialize ke JSON (string, number).
 */
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  playedAt: string; // ISO date string, BUKAN object Date
}

/**
 * Status/mode aplikasi saat ini.
 *
 * Kenapa pakai union type string literal seperti ini, bukan boolean
 * terpisah (misal isLoading, isFinished, dst)?
 * Karena dengan boolean terpisah, ada kemungkinan state yang "mustahil"
 * tapi tetap bisa terjadi secara teknis (misal isLoading=true DAN
 * isFinished=true di saat bersamaan, padahal itu tidak masuk akal).
 * Dengan union type seperti ini, aplikasi HANYA BISA berada di
 * satu mode dalam satu waktu — lebih aman dan predictable.
 */
export type QuizStatus =
  | "idle" // belum mulai, di start screen
  | "loading" // sedang fetch soal dari API
  | "error" // fetch gagal
  | "playing" // sedang mengerjakan soal
  | "finished" // sudah selesai, di result screen
  | "leaderboard"; // sedang melihat papan peringkat
/**
 * Jawaban yang sudah dipilih user untuk satu soal,
 * dipakai untuk tracking riwayat jawaban (opsional, berguna
 * kalau nanti mau menampilkan review jawaban per soal).
 */
export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | null; // null kalau user tidak sempat jawab (timer habis)
  isCorrect: boolean;
}