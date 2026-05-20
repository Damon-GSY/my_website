import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Damon Guan",
  description:
    "Explore Damon Guan's projects — AI research agents, productivity tools, content creation kits, and more. Building at the intersection of AI and practical tools.",
  openGraph: {
    title: "Projects | Damon Guan",
    description:
      "AI research agents, productivity suites, content tools, and more. See what I'm building.",
    type: "website",
    locale: "en_US",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
