import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.playmazegame.com"),
  title: "Maze Game Online – PlayMazeGame",
  description:
    "Play Maze Game online for free. Solve challenging labyrinth puzzles with fog of war, keys, sequences and progressive difficulty. Optimized for mobile and desktop.",
  openGraph: {
    title: "Maze Game Online – PlayMazeGame",
    description: "Solve challenging maze puzzles online. Mobile and desktop friendly.",
    url: "https://www.playmazegame.com",
    siteName: "PlayMazeGame",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Maze Game Online – PlayMazeGame",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maze Game Online – PlayMazeGame",
    description: "Solve challenging maze puzzles online. Mobile and desktop friendly.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NHMWTRWTMF"
          strategy="afterInteractive"
        />
        <Script strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NHMWTRWTMF');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
