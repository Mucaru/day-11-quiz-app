import type { Metadata, Viewport } from "next";
import { Figtree, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Font body: Figtree — clean, netral, readable.
 * Font heading: Space Grotesk — geometris, playful, tapi tetep profesional.
 * Keduanya di-load via next/font (self-hosted, no CLS, no runtime request).
 */
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display", // <-- ganti dari --font-heading
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuizMind — Test Your Knowledge",
  description:
    "Interactive quiz app with real-time timer, multiple categories, and leaderboard. Challenge yourself daily.",
  keywords: ["quiz", "trivia", "knowledge", "learning", "leaderboard"],
  authors: [{ name: "Mucaru Digital Works" }],
  openGraph: {
    title: "QuizMind — Test Your Knowledge",
    description: "Interactive quiz with timer, categories, and leaderboard.",
    type: "website",
  },
};

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
    <html
      lang="en"
      className={cn("font-sans", figtree.variable, spaceGrotesk.variable)}
      suppressHydrationWarning
    >
      {/*
        suppressHydrationWarning wajib ada di <html> saat pakai next-themes,
        karena class "dark"/"light" di-set client-side setelah hydration —
        tanpa ini React bakal warning mismatch di console (tapi harmless).
      */}
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}