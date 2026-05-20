import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links | Damon Guan",
  description:
    "All of Damon Guan's links in one place — YouTube, GitHub, LinkedIn, Bilibili, and more. Find and follow across platforms.",
  openGraph: {
    title: "Links | Damon Guan",
    description:
      "All my links in one place — YouTube, GitHub, LinkedIn, and more.",
    type: "website",
    locale: "en_US",
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
