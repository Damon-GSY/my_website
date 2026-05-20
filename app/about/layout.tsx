export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Damon Guan",
    url: "https://damonguan.com",
    jobTitle: "AI Content Creator & Researcher",
    description:
      "NUS Master's student sharing how AI transforms the way we work and learn. Creator of the gdamon YouTube channel.",
    sameAs: [
      "https://www.youtube.com/@gd.amon",
      "https://github.com/Damon-GSY",
      "https://www.linkedin.com/in/shengyue-guan-1a7b3226b/",
      "https://space.bilibili.com/358541297",
    ],
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "National University of Singapore",
      },
      {
        "@type": "EducationalOrganization",
        name: "University of New South Wales",
      },
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Productivity",
      "Content Creation",
      "Academic Research",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {children}
    </>
  );
}
