/**
 * useTimer — Custom Hook untuk Timer Per Soal
 *
 * Tanggung jawab hook ini:
 * 1. Jalankan countdown setiap detik saat quiz sedang berlangsung
 * 2. Panggil timeOut() dari store saat waktu habis
 * 3. Reset timer saat soal berganti (currentQuestionIndex berubah)
 * 4. Berhenti total saat quiz tidak sedang berlangsung
 * 5. Cleanup interval saat komponen unmount (cegah memory leak)
 *
 * Kenapa hook ini tidak punya state sendiri?
 * Karena "berapa detik tersisa" adalah data yang dibutuhkan
 * oleh banyak komponen (Timer display, progress bar, dll).
 * Kalau disimpan di hook lokal, komponen lain tidak bisa baca.
 * Jadi kita simpan timeLeft di Zustand store, hook ini hanya
 * bertugas "menjalankan mekanisme" countdown-nya.
 */

import { useEffect, useRef } from "react";
import { useQuizStore } from "../store/useQuizStore";

export function useTimer() {
  const status = useQuizStore((state) => state.status);
  const currentQuestionIndex = useQuizStore(
    (state) => state.currentQuestionIndex
  );
  const timeLeft = useQuizStore((state) => state.timeLeft);
  const isAnswerRevealed = useQuizStore((state) => state.isAnswerRevealed);
  const decrementTimer = useQuizStore((state) => state.decrementTimer);
  const resetTimer = useQuizStore((state) => state.resetTimer);
  const timeOut = useQuizStore((state) => state.timeOut);

  /**
   * useRef untuk menyimpan referensi interval.
   *
   * Kenapa useRef, bukan useState?
   * Karena kita tidak mau komponen re-render setiap kali
   * nilai intervalRef berubah. useRef menyimpan nilai yang
   * "persisten" antar render tapi tidak trigger re-render.
   *
   * Analogi: useRef itu seperti sticky note yang kamu tempel
   * di monitor — kamu bisa baca dan update kapan saja,
   * tapi mengganti sticky note itu tidak bikin kamu harus
   * "mengulang hari dari awal" (tidak trigger re-render).
   */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fungsi helper untuk membersihkan interval yang sedang jalan.
   *
   * Kenapa dibungkus fungsi, bukan langsung clearInterval?
   * Karena clearInterval(null) aman (tidak error), tapi
   * pola ini lebih eksplisit dan mudah dibaca:
   * "hapus interval yang ada, set ref ke null".
   * Kita pakai di beberapa tempat jadi tidak DRY kalau diulang.
   */
  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /**
   * EFFECT #1: Reset timer setiap kali soal berganti.
   *
   * Dependency array: [currentQuestionIndex]
   * Artinya: effect ini jalan ulang setiap kali index soal berubah.
   *
   * Kenapa kita perlu reset timer saat soal berganti?
   * Karena setiap soal punya jatah waktu sendiri (15 detik).
   * Tanpa reset, timer akan lanjut dari hitungan soal sebelumnya.
   */
  useEffect(() => {
    resetTimer();
  }, [currentQuestionIndex, resetTimer]);

  /**
   * EFFECT #2: Jalankan/hentikan interval berdasarkan kondisi.
   *
   * Dependency array: [status, timeLeft, isAnswerRevealed, ...]
   *
   * Timer BERJALAN hanya ketika:
   * - status === "playing" (quiz sedang berlangsung)
   * - isAnswerRevealed === false (belum ada jawaban dipilih/waktu habis)
   * - timeLeft > 0 (masih ada waktu)
   *
   * Timer BERHENTI ketika salah satu kondisi di atas tidak terpenuhi.
   */
  useEffect(() => {
    // Kondisi: timer tidak boleh jalan
    const shouldStop =
      status !== "playing" || isAnswerRevealed || timeLeft <= 0;

    if (shouldStop) {
      clearCurrentInterval();

      // Khusus: kalau waktu habis dan jawaban belum direveal,
      // panggil timeOut() untuk trigger logika "gagal jawab"
      if (timeLeft <= 0 && !isAnswerRevealed && status === "playing") {
        timeOut();
      }

      return;
    }

    /**
     * Buat interval baru.
     *
     * Kenapa kita clearInterval dulu sebelum setInterval baru?
     * Untuk mencegah "timer zombie" — situasi di mana ada
     * lebih dari satu interval jalan bersamaan karena effect
     * ini jalan berkali-kali tanpa cleanup interval sebelumnya.
     *
     * Setiap kali effect re-run (karena dependency berubah),
     * kita mulai fresh: hapus yang lama, buat yang baru.
     */
    clearCurrentInterval();

    intervalRef.current = setInterval(() => {
      /**
       * Kenapa kita panggil decrementTimer() (action dari store),
       * bukan langsung update nilai timeLeft di sini?
       *
       * Ini solusi untuk "stale closure" problem.
       * Kalau kita pakai timeLeft langsung di dalam setInterval callback,
       * nilai timeLeft yang dibaca adalah nilai SAAT interval dibuat,
       * bukan nilai SAAT interval berdetak. Ini karena JavaScript
       * "mengunci" (closes over) nilai variabel saat fungsi dibuat.
       *
       * Dengan memanggil action store, kita mendelegasikan
       * pembacaan nilai terbaru ke dalam store (yang pakai get()
       * untuk baca nilai saat ini) — bebas dari stale closure.
       */
      decrementTimer();
    }, 1000);

    /**
     * CLEANUP FUNCTION — ini yang mencegah memory leak.
     *
     * React akan menjalankan fungsi cleanup ini:
     * 1. Sebelum effect jalan ulang (dependency berubah)
     * 2. Saat komponen unmount (dihapus dari DOM)
     *
     * Analogi: cleanup function itu seperti "mematikan kompor"
     * sebelum kamu pergi atau sebelum masak resep berikutnya.
     * Tanpa ini, kompor (interval) tetap nyala terus.
     */
    return () => {
      clearCurrentInterval();
    };
  }, [status, timeLeft, isAnswerRevealed, decrementTimer, timeOut]);
}