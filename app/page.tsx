import { HeroSection } from "@/components/sections/hero";
import { AboutBriefSection } from "@/components/sections/about-brief";
import { VideosSection } from "@/components/sections/videos-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";

export default function Home() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Damon Guan | I Build AI",
    url: "https://damonguan.com",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection />
      <AboutBriefSection />
      <VideosSection />
      <ProjectsSection />
      <NewsletterSection />
    </>
  );
}
