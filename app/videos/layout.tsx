import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos | Damon Guan",
  description:
    "Watch Damon Guan's videos on AI tools, productivity hacks, academic research, and tech insights. All content from the gdamon YouTube channel in one place.",
  openGraph: {
    title: "Videos | Damon Guan",
    description:
      "AI tools, productivity, and tech videos from gdamon. Watch and learn.",
    type: "website",
    locale: "en_US",
  },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
