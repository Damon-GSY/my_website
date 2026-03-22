import { forwardRef } from 'react';
import { ShimmerButton } from './ui/shimmer-button';
import { BlurFade } from './ui/blur-fade';

const Hero = forwardRef(function Hero(props, ref) {
  return (
    <section className="relative w-full overflow-hidden" id="home">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-20 pb-12 lg:pt-28 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Text Content */}
          <div className="space-y-6">
            {/* Label */}
            <BlurFade delay={0}>
              <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase">
                Based in Singapore — Available for Scale
              </p>
            </BlurFade>

            {/* Headline */}
            <BlurFade delay={0.1}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Hi, I'm Damon.
              </h1>
            </BlurFade>

            {/* Description */}
            <BlurFade delay={0.2}>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
                I bridge the gap between human intuition and machine intelligence.
                I help founders and enterprise teams deploy custom LLM architectures
                that don't just process data — they generate value.
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
                    className="px-6 py-3 text-white font-semibold text-sm"
                  >
                    Subscribe on YouTube
                  </ShimmerButton>
                </a>
                <a
                  href="https://space.bilibili.com/358541297"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 font-semibold text-sm text-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100"
                >
                  Read My Newsletter
                </a>
              </div>
            </BlurFade>
          </div>

          {/* Right: Photo + Floating Card */}
          <BlurFade delay={0.2} className="relative">
            {/* Photo Card */}
            <div className="aspect-[4/5] max-w-[400px] mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/30 border border-white/50">
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <div className="text-center">
                  <div className="text-6xl mb-2">👨‍💻</div>
                  <p className="text-sm">Your Photo Here</p>
                </div>
              </div>
            </div>

            {/* Floating "I Build AI" Card */}
            <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white dark:bg-zinc-900 px-5 py-4 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 font-mono text-sm font-bold text-blue-600 dark:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-default z-20">
              I Build AI
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
});

export default Hero;
