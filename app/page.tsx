import { QuizApp } from "@/features/quiz/components/QuizApp";

/**
 * Halaman utama quiz app.
 *
 * Sengaja dibuat sesederhana ini — page.tsx hanya bertanggung jawab
 * untuk "mounting" komponen utama. Semua logic dan layout ada di
 * dalam QuizApp dan komponen-komponen di dalamnya.
 *
 * Ini adalah Server Component (default di App Router).
 * QuizApp sendiri akan menjadi Client Component karena butuh
 * akses ke Zustand store dan event handler.
 *
 * Prinsip: "push client boundary as deep as possible"
 * Artinya: biarkan level atas tetap Server Component selama bisa,
 * baru gunakan "use client" di komponen yang benar-benar butuhnya.
 * Ini mengoptimalkan bundle size dan initial load performance.
 */
export default function Home() {
  return (
    <main className="min-h-dvh bg-[--color-bg] flex flex-col">
      <QuizApp />
    </main>
  );
}