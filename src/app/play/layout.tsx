import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play infitoe",
  description: "We fixed tic-tac-toe. No more boring ties, just pure strategy.",
  keywords: "play tic-tac-toe, online game, strategy game, infitoe game",
};

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
