import { ShimmerButton } from './ui/shimmer-button';
import { BlurFade } from './ui/blur-fade';
import { TextShimmer } from './ui/text-shimmer';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden" id="home">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text Content - 7 columns */}
          <div className="lg:col-span-7 space-y-8">
            {/* Label */}
            <BlurFade delay={0}>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold font-[Cartograph_CF,Georgia,serif]">
                Based in London - Available for Scale
              </span>
            </BlurFade>

            {/* Headline */}
            <BlurFade delay={0.1}>
              <h1 className="text-5xl md:text-6xl lg:text-[5rem] font-bold leading-[1.1] tracking-tight font-[Cartograph_CF,Georgia,serif] text-[var(--text)]">
                Hi, I'm Damon.
                <br />
                <span className="hover-trigger inline-block relative group">
                  <TextShimmer as="span" className="italic" duration={2.5}>
                    I Build AI
                  </TextShimmer>
                  {/* Tooltip / Popover */}
                  <div className="popover-reveal absolute bottom-full left-0 mb-4 w-64 bg-[var(--surface-soft)] dark:bg-zinc-800 border border-[var(--line)] dark:border-zinc-700 p-4 rounded-xl shadow-2xl backdrop-blur-md z-50">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">Agent Architecture</span>
                      </div>
                      <div className="h-px bg-[var(--line)] dark:bg-zinc-700" />
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">Vertical Models</span>
                      </div>
                    </div>
                    {/* Arrow pointer */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[var(--surface-soft)] dark:bg-zinc-800 border-b border-r border-[var(--line)] dark:border-zinc-700 rotate-45" />
                  </div>
                </span>
              </h1>
            </BlurFade>

            {/* Description */}
            <BlurFade delay={0.2}>
              <p className="text-base md:text-lg text-[var(--muted)] max-w-xl leading-relaxed">
                I bridge the gap between human intuition and machine intelligence.
                I help founders and enterprise teams deploy custom LLM architectures
                that don't just process data - they generate value.
              </p>
            </BlurFade>

            {/* CTA Buttons */}
            <BlurFade delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    background="linear-gradient(135deg, #dc2626, #ef4444)"
                    borderRadius="9999px"
                    className="px-8 py-4 text-white font-semibold"
                  >
                    Subscribe on YouTube
                  </ShimmerButton>
                </a>
                <a
                  href="https://space.bilibili.com/358541297"
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 rounded-full border border-[var(--line)] dark:border-zinc-700 font-semibold text-center hover:bg-[var(--surface-soft)] dark:hover:bg-zinc-800 transition-colors text-[var(--text)]"
                >
                  Read My Newsletter
                </a>
              </div>
            </BlurFade>
          </div>

          {/* Right: Avatar - 5 columns */}
          <BlurFade delay={0.2} className="lg:col-span-5 relative">
            {/* Main Photo Card */}
            <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/30">
              <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                <div className="text-center">
                  <div className="text-6xl mb-2">👨‍💻</div>
                  <p className="text-sm">Your Photo Here</p>
                </div>
              </div>
            </div>

            {/* Floating Current Project Card */}
            <div className="absolute -bottom-8 -left-8 bg-[var(--surface)] dark:bg-zinc-900 p-6 rounded-lg shadow-xl max-w-[200px] hidden md:block border border-[var(--line)] dark:border-zinc-800">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Current Project</p>
              <p className="text-sm font-[Cartograph_CF,Georgia,serif] italic text-[var(--text)]">
                Architecting 'Lumina'-the next generation of neural UI frameworks.
              </p>
            </div>
          </BlurFade>
        </div>
      </div>

      {/* Popover Animation Styles */}
      <style>{`
        .popover-reveal {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .hover-trigger:hover .popover-reveal {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
      `}</style>
    </section>
  );
}
