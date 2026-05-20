import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Damon Guan",
  description:
    "Thoughts, tutorials, and deep dives into AI, productivity, and technology by Damon Guan. Long-form articles to help you stay ahead.",
  openGraph: {
    title: "Blog | Damon Guan",
    description:
      "Thoughts, tutorials, and deep dives into AI, productivity, and tech.",
    type: "website",
    locale: "en_US",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
