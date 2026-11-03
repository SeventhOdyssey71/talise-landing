import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";

import "./fonts.css";
import "./globals.css";
import "./site.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Talise",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.talise.io"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
