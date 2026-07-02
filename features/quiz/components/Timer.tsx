"use client";

/**
 * Timer — Circular Progress Ring
 *
 * Komponen PURE UI: tidak ada logic, tidak ada state lokal.
 * Hanya menerima props dan merender visual yang sesuai.
 *
 * Kenapa pure UI component?
 * Supaya Timer bisa dipakai di mana saja hanya dengan
 * mengoper angka. Mudah dites, mudah di-reuse.
 *
 * Teknik SVG Circle Progress:
 * - Kita pakai <circle> dengan stroke-dasharray = keliling lingkaran
 * - stroke-dashoffset kita animasi dari 0 (penuh) ke keliling (kosong)
 * - Ini adalah teknik standard untuk circular progress di web
 */

import { useQuizStore } from "../store/useQuizStore";
import { TIMER_DURATION } from "@/constants/quiz";

// Konstanta geometri lingkaran timer
const RADIUS = 45; // radius lingkaran dalam SVG units
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // keliling = 2πr ≈ 283

export function Timer() {
  const timeLeft = useQuizStore((s) => s.timeLeft);
  const isAnswerRevealed = useQuizStore((s) => s.isAnswerRevealed);

  /**
   * Hitung seberapa banyak "progress" yang sudah terpakai.
   * progress: 0 = penuh (awal), 1 = kosong (habis)
   *
   * Contoh: timeLeft=10, TIMER_DURATION=15
   * progress = 1 - (10/15) = 1 - 0.667 = 0.333
   * artinya 33.3% progress bar sudah "terkuras"
   */
  const progress = 1 - timeLeft / TIMER_DURATION;

  /**
   * stroke-dashoffset menentukan berapa banyak garis yang "disembunyikan".
   * 0 = semua garis terlihat (lingkaran penuh)
   * CIRCUMFERENCE = semua garis disembunyikan (lingkaran kosong)
   */
  const strokeDashoffset = CIRCUMFERENCE * progress;

  /**
   * Warna berubah berdasarkan urgensi waktu.
   * Ini memberikan feedback visual tanpa perlu user baca angka.
   *
   * > 60% sisa waktu → biru (tenang)
   * 30-60% sisa waktu → kuning (waspada)
   * < 30% sisa waktu → merah (urgent)
   */
  const getColor = () => {
    const ratio = timeLeft / TIMER_DURATION;
    if (ratio > 0.6) return "var(--color-accent)";
    if (ratio > 0.3) return "var(--color-timeout)";
    return "var(--color-incorrect)";
  };

  const color = getColor();

  /**
   * Ukuran teks angka: makin sedikit waktu, sedikit lebih besar
   * untuk menambah efek "urgency".
   */
  const isUrgent = timeLeft <= 5 && !isAnswerRevealed;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG container */}
      <svg
        width="88"
        height="88"
        viewBox="0 0 100 100"
        className="-rotate-90"
        /**
         * rotate-90 supaya progress mulai dari atas (jam 12),
         * bukan dari kanan (jam 3) yang merupakan default SVG.
         * Kita rotate SVG-nya, bukan circle-nya,
         * supaya tidak perlu adjust koordinat start point.
         */
        aria-hidden="true"
      >
        {/* Track: lingkaran latar belakang (abu-abu tipis) */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="6"
        />

        {/* Progress: lingkaran yang animasi mengecil */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          /**
           * strokeDasharray: pola garis-spasi.
           * Nilai tunggal CIRCUMFERENCE berarti: panjang garis = CIRCUMFERENCE,
           * panjang spasi = CIRCUMFERENCE. Jadi seluruh lingkaran bisa
           * tergambar penuh (offset=0) atau tidak tergambar sama sekali
           * (offset=CIRCUMFERENCE).
           */
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          style={{
            /**
             * Transisi smooth setiap kali strokeDashoffset berubah.
             * 0.9s karena timer berdetak setiap 1 detik —
             * kita beri sedikit buffer supaya animasi tidak "terputus-putus".
             */
            transition: `stroke-dashoffset 0.9s linear, stroke 0.3s ease`,
          }}
        />
      </svg>

      {/* Angka countdown di tengah lingkaran */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        /**
         * rotate-0 di sini karena parent SVG di-rotate -90deg.
         * Kita tidak ikut rotate angkanya — teks harus tetap tegak.
         * Div ini adalah sibling dari SVG (bukan child), jadi
         * tidak terpengaruh oleh rotate SVG.
         */
      >
        <span
          className="font-bold tabular-nums transition-all duration-300"
          style={{
            color,
            fontSize: isUrgent ? "1.35rem" : "1.15rem",
            /**
             * tabular-nums: semua angka punya lebar yang sama.
             * Tanpa ini, angka seperti "1" lebih sempit dari "8",
             * jadi teks akan "bergeser" setiap detik saat angka berubah.
             * Dengan tabular-nums: semua angka sejajar sempurna.
             */
          }}
          aria-live="polite"
          aria-label={`${timeLeft} seconds remaining`}
          /**
           * aria-live="polite": screen reader akan mengumumkan
           * perubahan nilai ini tapi tidak menginterupsi pembacaan lain.
           * Ini penting untuk aksesibilitas.
           */
        >
          {timeLeft}
        </span>
      </div>

      {/* Pulse ring saat waktu kritis (≤ 5 detik) */}
      {isUrgent && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
            animation: "pulse-ring 1s ease-in-out infinite",
            opacity: 0.4,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}