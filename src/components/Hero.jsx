import { TextShimmer } from './ui/text-shimmer';
import { VaporizeTextCycle } from './ui/vaporize-text';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden" id="home">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Layer 3: Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <p className="mb-8 inline-block rounded-full border border-zinc-700 bg-zinc-800/50 px-5 py-2 text-base text-zinc-300">
            Hi, I'm Damon
          </p>

          {/* Main Title with Vaporize Effect */}
          <div className="mb-8 h-32 md:h-44 lg:h-52">
            <VaporizeTextCycle
              texts={['I Build AI', 'I Share AI', 'I Love AI']}
              font={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(48px, 10vw, 120px)',
                fontWeight: 700,
              }}
              color="rgb(255, 255, 255)"
            />
          </div>

          {/* Subtitle */}
          <TextShimmer
            as="p"
            duration={3}
            className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Product builder, writer, and creator. I share practical ideas about productivity, AI workflows, and online business.
          </TextShimmer>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-all hover:bg-zinc-200"
            >
              View Projects
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-transparent px-8 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            >
              About Me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
