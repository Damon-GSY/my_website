import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Damon Guan. Collaborate on AI projects, discuss ideas, or just say hi. Reach out via email, GitHub, YouTube, or LinkedIn.",
  openGraph: {
    title: "Contact",
    description:
      "Get in touch with Damon Guan. Collaborate on AI projects, discuss ideas, or just say hi.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
