import { videos } from "@/data/videos";

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const videoSchemas = videos.map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.title,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    ...(video.thumbnail && { thumbnailUrl: video.thumbnail }),
  }));

  return (
    <>
      {videoSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  );
}
