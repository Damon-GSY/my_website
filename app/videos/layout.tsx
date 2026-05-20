import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Watch Damon Guan's videos on AI tools, productivity tips, and tech insights. All videos from the gdamon YouTube channel in one place.",
  openGraph: {
    title: "Videos",
    description:
      "Watch Damon Guan's videos on AI tools, productivity tips, and tech insights.",
  },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
