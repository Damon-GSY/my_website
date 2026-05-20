import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Damon Guan",
  description:
    "Get in touch with Damon Guan for collaboration, project ideas, or just to say hi. Reach out via email, GitHub, YouTube, or LinkedIn.",
  openGraph: {
    title: "Contact | Damon Guan",
    description:
      "Have an idea or want to collaborate? Let's talk.",
    type: "website",
    locale: "en_US",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
