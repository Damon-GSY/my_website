import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts, tutorials, and deep dives on AI, productivity, and technology by Damon Guan. Stay ahead in the fast-moving AI landscape.",
  openGraph: {
    title: "Blog",
    description:
      "Thoughts, tutorials, and deep dives on AI, productivity, and technology by Damon Guan.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
