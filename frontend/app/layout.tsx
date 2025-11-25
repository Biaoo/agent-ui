import "@copilotkit/react-ui/styles.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

// English body font - Inter, modern and clean
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// English monospace font - JetBrains Mono, suitable for code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Chinese sans-serif font - Noto Sans SC (Google Fonts version)
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Chinese serif font - Noto Serif SC, suitable for titles and emphasis
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AG-UI Demo",
  description: "A demonstration of AI Agent user interfaces with AG-UI protocol",
};

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased`}>
        <Navigation />
        <main className="pt-16 h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}