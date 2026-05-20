const links = [
  {
    label: "YouTube",
    url: "https://www.youtube.com/@gd.amon",
  },
  {
    label: "Bilibili",
    url: "https://space.bilibili.com/358541297",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/shengyue-guan-1a7b3226b/",
  },
  {
    label: "GitHub",
    url: "https://github.com/Damon-GSY",
  },
  {
    label: "Email",
    url: "mailto:contact@damonguan.com",
  },
];

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Damon Guan - Social Links",
    numberOfItems: links.length,
    itemListElement: links.map((link, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: link.label,
      url: link.url,
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
