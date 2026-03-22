import { forwardRef } from 'react';
import { ArrowUpRight, Linkedin, PlayCircle } from 'lucide-react';
import heroImage from '@/assets/hero.png';
import { ShimmerButton } from './ui/shimmer-button';
import { BlurFade } from './ui/blur-fade';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { Spotlight } from './ui/spotlight';

const Hero = forwardRef(function Hero(props, ref) {
  return (
    <section className="relative w-full overflow-hidden" id="home">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute top-[20%] right-[-15%] h-[30rem] w-[30rem] rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,250,249,0.82))]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-7">
            <BlurFade delay={0}>
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/90 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-zinc-600 uppercase">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Researcher + Creator
              </p>
            </BlurFade>

            <BlurFade delay={0.08}>
              <h1 className="max-w-2xl text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 leading-[1.06]">
                Hi, I&apos;m Damon.
                <br />
                <span className="mt-2 block">
                  <AnimatedGradientText speed={1.15} colorFrom="#0ea5e9" colorTo="#ef4444">
                    I build AI.
                  </AnimatedGradientText>
                </span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.16}>
              <p className="max-w-2xl text-xs md:text-sm font-medium tracking-[0.08em] uppercase text-zinc-500">
                Agent Systems · Agentic RL · Reinforcement Learning · Post-Training
              </p>
            </BlurFade>

            <BlurFade delay={0.24}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    background="linear-gradient(135deg, #0f172a, #1e293b)"
                    borderRadius="9999px"
                    className="px-6 py-3 text-white font-semibold text-sm"
                  >
                    Work With Me
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-900"
                >
                  <PlayCircle className="h-4 w-4 text-red-500" />
                  Watch on YouTube
                </a>
              </div>
            </BlurFade>

            <BlurFade delay={0.3}>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-zinc-500">
                <span>Find me on</span>
                <a
                  href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/75 px-3 py-1.5 font-medium text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-zinc-900 hover:bg-white hover:text-zinc-950 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]"
                >
                  <Linkedin className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                  LinkedIn
                </a>
                <a
                  href="https://space.bilibili.com/358541297"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/75 px-3 py-1.5 font-medium text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-zinc-900 hover:bg-white hover:text-zinc-950 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 transition-transform duration-300 group-hover:scale-125 group-hover:translate-x-0.5" />
                  Bilibili
                </a>
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={0.16} className="lg:col-span-5">
            <div className="relative mx-auto max-w-[27rem]">
              <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.25),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(239,68,68,0.24),transparent_50%)] blur-2xl" />

              <div className="group relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 shadow-[0_50px_100px_-60px_rgba(15,23,42,0.8)]">
                <Spotlight
                  size={280}
                  className="from-cyan-200 via-zinc-100 to-transparent opacity-70"
                />
                <img
                  src={heroImage}
                  alt="Portrait of Damon, AI researcher and creator"
                  className="h-full w-full object-cover grayscale-[18%] transition duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/35 via-transparent to-white/25" />
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
});

export default Hero;
