import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Welcome to infitoe",
  description: "We fixed tic-tac-toe. No more boring ties, just pure strategy.",
  keywords: "tic-tac-toe, game, infinite, strategy, online game, browser game",
  metadataBase: new URL("https://infitoe.vercel.app"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Play infitoe",
    description:
      "We fixed tic-tac-toe. No more boring ties, just pure strategy.",
    url: "https://infitoe.vercel.app",
    siteName: "infitoe",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="title" content="Play infitoe" />
        <meta
          name="description"
          content="We fixed tic-tac-toe. No more boring ties, just pure strategy."
        />
        <meta
          name="keywords"
          content="tic-tac-toe, game, infinite, strategy, online game, browser game"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#1e3a8a" />
        <link rel="canonical" href="https://infitoe.vercel.app" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              name: "infitoe",
              description:
                "We fixed tic-tac-toe. No more boring ties, just pure strategy.",
              url: "https://infitoe.vercel.app",
              applicationCategory: "GameApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
