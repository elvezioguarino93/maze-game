import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.playmazegame.com"),
  title: "Maze Game Online – PlayMazeGame",
  description:
    "Play Maze Game online for free. Solve challenging labyrinth puzzles with fog of war, keys, sequences and progressive difficulty. Optimized for mobile and desktop.",
  openGraph: {
    title: "Maze Game Online – PlayMazeGame",
    description:
      "Solve challenging maze puzzles online. Mobile and desktop friendly.",
    url: "https://www.playmazegame.com",
    siteName: "PlayMazeGame",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Maze Game – PlayMazeGame",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maze Game Online – PlayMazeGame",
    description:
      "Solve challenging maze puzzles online. Mobile and desktop friendly.",
    images: ["/og-image.png"],
  },
};
