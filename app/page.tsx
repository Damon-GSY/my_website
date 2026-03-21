import { HeroSection } from "@/components/sections/hero";
import { AboutBriefSection } from "@/components/sections/about-brief";
import { VideosSection } from "@/components/sections/videos-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutBriefSection />
      <VideosSection />
      <ProjectsSection />
      <NewsletterSection />
    </>
  );
}
