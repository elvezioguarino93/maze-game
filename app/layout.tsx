import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Maze Game Online – PlayMazegame",
  description: "Play Maze Game online. A challenging labyrinth puzzle game optimized for mobile and desktop.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
