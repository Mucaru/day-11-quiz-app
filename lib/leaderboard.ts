/**
 * LEADERBOARD DATA ACCESS LAYER
 *
 * Semua operasi baca/tulis leaderboard ke localStorage
 * dikumpulkan di sini. Tidak ada komponen atau store yang
 * boleh akses localStorage secara langsung untuk leaderboard.
 *
 * Keuntungan pola ini:
 * 1. Satu tempat untuk handle error localStorage
 * 2. Kalau besok ganti ke API/IndexedDB, cukup ubah file ini
 * 3. Aman dari SSR crash (Next.js render di server juga)
 */

import {
  LEADERBOARD_STORAGE_KEY,
  MAX_LEADERBOARD_ENTRIES,
} from "@/constants/quiz";
import type { LeaderboardEntry } from "@/types/quiz";

// ─────────────────────────────────────────────
// HELPER: CEK APAKAH BERJALAN DI BROWSER
// ─────────────────────────────────────────────

/**
 * Guard function untuk cek ketersediaan localStorage.
 *
 * Kenapa perlu ini? Next.js menjalankan kode di DUA environment:
 * 1. Server (Node.js) — saat build & SSR, TIDAK ada `window`
 * 2. Browser (Client) — saat user buka halaman, `window` ada
 *
 * Tanpa guard ini, akses `localStorage` saat SSR = ReferenceError crash.
 *
 * Kenapa tidak pakai `typeof window !== "undefined"` langsung di setiap fungsi?
 * Karena itu DRY violation — lebih baik abstrak ke satu helper.
 */
const isBrowser = (): boolean => typeof window !== "undefined";

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Ambil semua entry leaderboard dari localStorage.
 * Selalu return array (kosong kalau belum ada data atau error).
 *
 * Kenapa return [] daripada throw error?
 * Karena leaderboard kosong adalah kondisi VALID (user baru pertama main),
 * bukan kondisi error. Komponen yang memanggil fungsi ini tidak perlu
 * handle kasus "belum ada data" secara khusus — selalu dapat array.
 */
export function getLeaderboard(): LeaderboardEntry[] {
  // Guard: kalau di server, return array kosong langsung
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);

    // Kalau belum ada data sama sekali, return array kosong
    if (!raw) return [];

    // Parse JSON — ini yang bisa throw error kalau data corrupt
    const parsed = JSON.parse(raw);

    // Validasi ekstra: pastikan yang kita dapat memang array
    // (bukan object, string, atau tipe lain yang tidak kita harapkan)
    if (!Array.isArray(parsed)) return [];

    return parsed as LeaderboardEntry[];
  } catch {
    /**
     * Kenapa kita "diam" di sini (tidak re-throw error)?
     * Karena data leaderboard yang corrupt tidak boleh crash
     * seluruh aplikasi. Lebih baik tampilkan leaderboard kosong
     * daripada user tidak bisa main sama sekali.
     *
     * Di production nyata, di sini kita akan log ke monitoring
     * service (misal Sentry): logger.warn("Leaderboard data corrupt")
     */
    return [];
  }
}

// ─────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────

/**
 * Tambahkan entry baru ke leaderboard.
 *
 * Flow:
 * 1. Ambil data lama
 * 2. Gabungkan dengan entry baru
 * 3. Urutkan berdasarkan skor (tertinggi di atas)
 * 4. Potong jadi MAX_LEADERBOARD_ENTRIES entry teratas
 * 5. Simpan kembali ke localStorage
 *
 * Kenapa fungsi ini juga me-return LeaderboardEntry[]?
 * Supaya caller (Zustand store) bisa langsung update state-nya
 * dengan data terbaru tanpa perlu memanggil getLeaderboard() lagi.
 * Ini mengurangi satu round-trip baca localStorage yang tidak perlu.
 */
export function saveToLeaderboard(
  entry: Omit<LeaderboardEntry, "id" | "playedAt">
): LeaderboardEntry[] {
  if (!isBrowser()) return [];

  try {
    const existing = getLeaderboard();

    // Buat entry lengkap dengan id unik dan timestamp
    const newEntry: LeaderboardEntry = {
      ...entry,
      /**
       * Kenapa id-nya pakai Date.now() + random, bukan sequential number?
       * Karena sequential number (1, 2, 3...) butuh kita tahu
       * berapa id terakhir — artinya harus baca data dulu.
       * Date.now() + random cukup unik untuk skala lokal ini
       * dan tidak perlu round-trip tambahan.
       *
       * Di production skala besar: pakai UUID (crypto.randomUUID())
       * atau ID dari database.
       */
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      playedAt: new Date().toISOString(),
    };

    const updated = [...existing, newEntry]
      // Urutkan: skor tertinggi dulu, kalau skor sama → yang lebih lama dulu
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tiebreaker: waktu bermain lebih awal = lebih baik
        return new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime();
      })
      // Hanya ambil top N entry
      .slice(0, MAX_LEADERBOARD_ENTRIES);

    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));

    return updated;
  } catch {
    /**
     * localStorage bisa gagal kalau:
     * - Storage penuh (QuotaExceededError)
     * - Browser dalam mode private tertentu
     *
     * Return data lama tanpa crash — user tetap bisa lihat hasil
     * meski tidak tersimpan permanen.
     */
    return getLeaderboard();
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Hapus seluruh leaderboard.
 * Dipakai untuk fitur "Reset Leaderboard" (opsional di UI).
 *
 * Return boolean: true kalau berhasil, false kalau gagal.
 * Kenapa return boolean, bukan void?
 * Supaya UI bisa tahu apakah operasi berhasil dan
 * menampilkan feedback yang tepat (toast "Berhasil direset"
 * vs "Gagal mereset").
 */
export function clearLeaderboard(): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}