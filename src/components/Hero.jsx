import { ShaderAnimation } from './ui/shader-animation';
import { WavyBackground } from './ui/wavy-background';
import { TextShimmer } from './ui/text-shimmer';
import { VaporizeTextCycle } from './ui/vaporize-text';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden" id="home">
      {/* Layer 1: Shader Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <ShaderAnimation />
      </div>

      {/* Layer 2: Wavy Background */}
      <div className="absolute inset-0 z-[1]">
        <WavyBackground
          colors={['#3b82f6', '#8b5cf6', '#06b6d4']}
          waveWidth={60}
          blur={15}
          speed="slow"
          waveOpacity={0.3}
        />
      </div>

      {/* Layer 3: Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <p className="mb-6 inline-block rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400">
            Hi, I'm Damon
          </p>

          {/* Main Title with Vaporize Effect */}
          <div className="mb-6 h-20 md:h-28">
            <VaporizeTextCycle
              texts={['I Build AI', 'I Share AI', 'I Love AI']}
              font={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '48px',
                fontWeight: 700,
              }}
              color="rgb(255, 255, 255)"
            />
          </div>

          {/* Subtitle */}
          <TextShimmer
            as="p"
            duration={3}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
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
