import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore Damon Guan's projects — AI research agents, productivity tools, content creation kits, and more. Building at the intersection of AI and practical tools.",
  openGraph: {
    title: "Projects",
    description:
      "Explore Damon Guan's projects — AI research agents, productivity tools, and more.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
