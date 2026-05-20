const projects = [
  {
    title: "AI Research Agent",
    url: "https://damonguan.com/projects",
  },
  {
    title: "Productivity Suite",
    url: "https://damonguan.com/projects",
  },
  {
    title: "Content Creator Kit",
    url: "https://damonguan.com/projects",
  },
  {
    title: "Tech Blog",
    url: "https://damonguan.com/projects",
  },
  {
    title: "Academic Helper",
    url: "https://damonguan.com/projects",
  },
];

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projects by Damon Guan",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: project.title,
      url: project.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {children}
    </>
  );
}
