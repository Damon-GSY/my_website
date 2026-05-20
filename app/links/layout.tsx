import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
  description:
    "All of Damon Guan's links in one place — YouTube, Bilibili, LinkedIn, GitHub, and email. Find and follow across every platform.",
  openGraph: {
    title: "Links",
    description:
      "All of Damon Guan's links in one place — YouTube, Bilibili, LinkedIn, GitHub, and more.",
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
