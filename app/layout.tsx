import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Damon Guan | I Build AI",
  description:
    "Tech enthusiast sharing how AI transforms the way we work and learn. NUS Master's student, UNSW graduate, and the person behind gdamon.",
  keywords: [
    "AI",
    "productivity",
    "tech",
    "Damon Guan",
    "machine learning",
    "content creator",
  ],
  authors: [{ name: "Damon Guan" }],
  openGraph: {
    title: "Damon Guan | I Build AI",
    description:
      "Tech enthusiast sharing how AI transforms the way we work and learn.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <I18nProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
