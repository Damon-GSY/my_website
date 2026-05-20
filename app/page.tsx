import { HeroSection } from "@/components/sections/hero";
import { AboutBriefSection } from "@/components/sections/about-brief";
import { VideosSection } from "@/components/sections/videos-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ErrorBoundary } from "@/components/error-boundary";
import dynamic from "next/dynamic";

const ShaderAnimation = dynamic(
  () =>
    import("@/components/ui/shader-animation").then((m) => {
      const Wrapped = () => (
        <ErrorBoundary>
          <m.ShaderAnimation />
        </ErrorBoundary>
      );
      Wrapped.displayName = "ShaderAnimation";
      return Wrapped;
    }),
  { ssr: false },
);

const GlowyWaves = dynamic(
  () =>
    import("@/components/ui/glowy-waves").then((m) => {
      const Wrapped = () => (
        <ErrorBoundary>
          <m.GlowyWaves />
        </ErrorBoundary>
      );
      Wrapped.displayName = "GlowyWaves";
      return Wrapped;
    }),
  { ssr: false },
);

const VaporizeTextCycle = dynamic(
  () =>
    import("@/components/ui/vapour-text-effect").then((m) => {
      const Wrapped = (props: React.ComponentProps<typeof m.default>) => (
        <ErrorBoundary>
          <m.default {...props} />
        </ErrorBoundary>
      );
      Wrapped.displayName = "VaporizeTextCycle";
      return Wrapped;
    }),
  { ssr: false },
);

export { ShaderAnimation, GlowyWaves, VaporizeTextCycle };

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
