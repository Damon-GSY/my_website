import { forwardRef, useRef } from 'react';
import { ArrowUpRight, Linkedin, PlayCircle } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import heroImage from '@/assets/hero.png';
import { ShimmerButton } from './ui/shimmer-button';
import { BlurFade } from './ui/blur-fade';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { Spotlight } from './ui/spotlight';
import { WavyBackground } from './ui/wavy-background';
import { ElegantShape } from './ui/shape-landing-hero';

const springTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
  mass: 0.8,
};

const Hero = forwardRef(function Hero(props, ref) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const visualY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 36]);
  const visualScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.02, 0.985]);

  return (
    <section ref={heroRef} className="relative isolate overflow-hidden pt-16" id="home">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,#f7fafc_0%,#ecfeff_38%,#fff7ed_100%)]" />
        <WavyBackground
          containerClassName="absolute inset-0 opacity-35"
          colors={['#0ea5e9', '#f97316', '#fb7185', '#22c55e']}
          waveWidth={58}
          speed="slow"
          blur={12}
          backgroundFill="transparent"
          waveOpacity={0.08}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.22),transparent_42%),radial-gradient(circle_at_82%_80%,rgba(249,115,22,0.16),transparent_44%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.92)_42%,rgba(255,255,255,0.62)_72%,rgba(255,255,255,0.25)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-50">
        <ElegantShape
          delay={0.2}
          width={460}
          height={105}
          rotate={10}
          gradient="from-cyan-400/20"
          className="left-[-9%] top-[18%]"
        />
        <ElegantShape
          delay={0.35}
          width={360}
          height={90}
          rotate={-14}
          gradient="from-orange-400/16"
          className="right-[-5%] top-[68%]"
        />
      </div>

      <div className="relative grid min-h-[calc(100svh-4rem)] grid-cols-1 lg:grid-cols-12">
        <div className="z-20 flex items-center px-6 py-10 sm:px-10 lg:col-span-5 lg:px-14 xl:px-20">
          <div className="w-full max-w-xl space-y-7">
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
                <motion.a
                  href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.01,
                        }
                  }
                  transition={springTransition}
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
                </motion.a>
                <motion.a
                  href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-900"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.01,
                        }
                  }
                  transition={springTransition}
                >
                  <PlayCircle className="h-4 w-4 text-red-500" />
                  Watch on YouTube
                </motion.a>
              </div>
            </BlurFade>

            <BlurFade delay={0.3}>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-zinc-500">
                <span>Find me on</span>
                <motion.a
                  href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/75 px-3 py-1.5 font-medium text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-zinc-900 hover:bg-white hover:text-zinc-950 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.03,
                        }
                  }
                  transition={springTransition}
                >
                  <Linkedin className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                  LinkedIn
                </motion.a>
                <motion.a
                  href="https://space.bilibili.com/358541297"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white/75 px-3 py-1.5 font-medium text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-zinc-900 hover:bg-white hover:text-zinc-950 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]"
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.03,
                        }
                  }
                  transition={springTransition}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 transition-transform duration-300 group-hover:scale-125 group-hover:translate-x-0.5" />
                  Bilibili
                </motion.a>
              </div>
            </BlurFade>
          </div>
        </div>

        <div className="relative flex items-end justify-center px-6 pb-8 sm:px-10 lg:col-span-7 lg:px-0 lg:pb-0">
          <BlurFade delay={0.16} className="w-full">
            <motion.div
              style={{ y: visualY, scale: visualScale }}
              className="relative mx-auto w-full max-w-[28rem] lg:mr-0 lg:max-w-[33rem] xl:max-w-[36rem]"
            >
              <div className="absolute -inset-8 rounded-[2.75rem] bg-[radial-gradient(circle_at_22%_16%,rgba(14,165,233,0.34),transparent_58%),radial-gradient(circle_at_78%_84%,rgba(249,115,22,0.24),transparent_56%)] blur-3xl" />

              <div className="group relative overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-zinc-100 shadow-[0_70px_120px_-70px_rgba(15,23,42,0.9)]">
                <Spotlight
                  size={320}
                  className="from-cyan-200 via-zinc-100 to-transparent opacity-75"
                />
                <img
                  src={heroImage}
                  alt="Portrait of Damon, AI researcher and creator"
                  className="h-full min-h-[460px] w-full object-cover object-center grayscale-[12%] contrast-[1.06] saturate-[0.95] transition duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/30 via-transparent to-white/24" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_35%,rgba(15,23,42,0.2)_100%)]" />
                <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply [background-image:radial-gradient(circle_at_1px_1px,#020617_1px,transparent_0)] [background-size:4px_4px]" />
              </div>

              <div className="pointer-events-none absolute -left-9 top-10 hidden h-20 w-20 rounded-full border border-cyan-300/55 bg-cyan-50/70 backdrop-blur sm:block" />
              <div className="pointer-events-none absolute -right-7 bottom-16 hidden h-14 w-14 rounded-full border border-orange-300/55 bg-orange-50/70 backdrop-blur sm:block" />
            </motion.div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
});

export default Hero;
