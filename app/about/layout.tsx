import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Damon Guan",
  description:
    "Learn about Damon Guan — NUS Master's student, AI enthusiast, and content creator behind gdamon. Passionate about how AI transforms work, learning, and creativity.",
  openGraph: {
    title: "About Damon Guan",
    description:
      "Learn about Damon Guan — NUS Master's student, AI enthusiast, and content creator behind gdamon.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
