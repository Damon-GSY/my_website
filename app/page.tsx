import dynamic from "next/dynamic";
import { HeroSection } from "@/components/sections/hero";

const AboutBriefSection = dynamic(
  () =>
    import("@/components/sections/about-brief").then(
      (mod) => mod.AboutBriefSection
    ),
  { loading: () => <SectionPlaceholder />, ssr: false }
);

const VideosSection = dynamic(
  () =>
    import("@/components/sections/videos-section").then(
      (mod) => mod.VideosSection
    ),
  { loading: () => <SectionPlaceholder />, ssr: false }
);

const ProjectsSection = dynamic(
  () =>
    import("@/components/sections/projects-section").then(
      (mod) => mod.ProjectsSection
    ),
  { loading: () => <SectionPlaceholder />, ssr: false }
);

const NewsletterSection = dynamic(
  () =>
    import("@/components/sections/newsletter-section").then(
      (mod) => mod.NewsletterSection
    ),
  { loading: () => <SectionPlaceholder />, ssr: false }
);

function SectionPlaceholder() {
  return <div className="min-h-[50vh]" />;
}

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
