import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Damon Guan",
  description:
    "Learn about Damon Guan — NUS Master's student, AI enthusiast, and content creator behind gdamon. Exploring how AI transforms the way we work and learn.",
  openGraph: {
    title: "About | Damon Guan",
    description:
      "NUS Master's student, AI enthusiast, and content creator. Get to know the person behind the code.",
    type: "website",
    locale: "en_US",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
