import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Setup font Inter dari Google Fonts via next/font.
 *
 * Kenapa pakai next/font, bukan <link> biasa di <head>?
 * next/font otomatis:
 * 1. Download font saat build time → tidak ada request ke Google saat runtime
 * 2. Self-host font di server kita sendiri → lebih cepat, lebih private
 * 3. Eliminasi Cumulative Layout Shift (CLS) — font tidak "loncat" saat load
 * 4. Generate CSS variable yang bisa kita pakai di mana saja
 *
 * subsets: ["latin"] → hanya download karakter latin, bukan seluruh unicode.
 * Ini mengurangi ukuran font file secara signifikan.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  /**
   * display: "swap" → tampilkan font fallback dulu saat Inter belum load,
   * lalu swap ke Inter saat sudah siap.
   * Alternatif "block" akan hide text sampai font siap — tidak bagus untuk UX.
   */
});

/**
 * Metadata untuk SEO dan social sharing.
 * Next.js akan inject ini ke <head> secara otomatis.
 *
 * Kenapa tidak tulis <meta> tag manual?
 * Karena Next.js Metadata API type-safe — kalau salah nama field,
 * TypeScript langsung error. Lebih aman dari nulis string HTML manual.
 */
export const metadata: Metadata = {
  title: "QuizMind — Test Your Knowledge",
  description:
    "Interactive quiz app with real-time timer, multiple categories, and leaderboard. Challenge yourself daily.",
  keywords: ["quiz", "trivia", "knowledge", "learning", "leaderboard"],
  authors: [{ name: "Mucaru Digital Works" }],
  /**
   * Open Graph: metadata untuk preview saat link di-share
   * ke WhatsApp, Twitter, LinkedIn, dll.
   */
  openGraph: {
    title: "QuizMind — Test Your Knowledge",
    description: "Interactive quiz with timer, categories, and leaderboard.",
    type: "website",
  },
};

/**
 * Viewport config dipisah dari metadata (best practice Next.js 14+).
 * Kenapa dipisah? Karena viewport tidak bisa di-override di child layout,
 * jadi Next.js memintanya dideklarasikan terpisah untuk kejelasan.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        lang="en" penting untuk aksesibilitas:
        screen reader akan tahu bahasa halaman ini
        dan membaca teks dengan aksen/pronounsiasi yang benar.

        className={inter.variable} → inject CSS variable --font-inter
        ke seluruh dokumen, sehingga globals.css bisa referensikan
        font ini via var(--font-inter).
      */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}