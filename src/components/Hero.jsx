import { forwardRef, useRef } from 'react';
import { ArrowUpRight, Linkedin, PlayCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImage from '@/assets/hero.png';
import { ShimmerButton } from './ui/shimmer-button';
import { BlurFade } from './ui/blur-fade';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { Spotlight } from './ui/spotlight';

const Hero = forwardRef(function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const photoY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const photoOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  const floatTransition = {
    duration: 6,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden" id="home" aria-labelledby="hero-heading">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute top-[20%] right-[-15%] h-[30rem] w-[30rem] rounded-full bg-[var(--primary-strong)]/8 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--bg)/90,var(--bg)/82)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-7">
            <BlurFade delay={0}>
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/90 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                AI Researcher + Creator
              </p>
            </BlurFade>

            <BlurFade delay={0.08}>
              <h1 id="hero-heading" className="max-w-2xl text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[var(--text)] leading-[1.06]">
                Hi, I&apos;m Damon.
                <br />
                <span className="mt-2 block font-bold">
                  <AnimatedGradientText speed={1.15} colorFrom="var(--primary)" colorTo="var(--primary-strong)">
                    I build AI.
                  </AnimatedGradientText>
                </span>
              </h1>
            </BlurFade>

          <BlurFade delay={0.16}>
            <p className="max-w-2xl text-xs md:text-sm font-medium tracking-[0.08em] uppercase text-[var(--muted)]">
              Agent Systems · Agentic RL · Reinforcement Learning · Post-Training
            </p>
          </BlurFade>

          <BlurFade delay={0.2}>
            <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[var(--muted-strong)]">
              I research and ship agent systems at Alibaba, and share practical AI breakdowns on YouTube, Bilibili, and LinkedIn.
            </p>
          </BlurFade>

            <BlurFade delay={0.26}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    background="linear-gradient(135deg, var(--surface), var(--surface-soft))"
                    borderRadius="9999px"
                    className="px-6 py-3 text-[var(--text)] font-semibold text-sm border-[var(--line)] active:scale-[0.97] transition-transform"
                  >
                    Work With Me
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--muted-strong)] transition-all duration-200 [box-shadow:0_0_0_1px_var(--ring)] hover:[box-shadow:0_0_0_1px_var(--ring-strong)] active:scale-[0.97]"
                >
                  <PlayCircle className="h-4 w-4 text-[var(--primary)]" />
                  Watch on YouTube
                </a>
              </div>
            </BlurFade>

            <BlurFade delay={0.3}>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-[var(--muted)]">
                <span>Find me on</span>
                <a
                  href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-transparent px-3 py-1.5 font-medium text-[var(--muted)] transition-all duration-200 [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)] active:scale-[0.97]"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
                <a
                  href="https://space.bilibili.com/358541297"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-transparent px-3 py-1.5 font-medium text-[var(--muted)] transition-all duration-200 [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)] active:scale-[0.97]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] group-hover:bg-[var(--primary-strong)]" />
                  Bilibili
                </a>
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={0.16} className="lg:col-span-5">
            <div className="relative mx-auto max-w-[27rem]">
              <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_15%,rgba(168,120,92,0.25),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(184,138,114,0.24),transparent_50%)] blur-2xl" />

              <motion.div
                style={{ y: photoY, scale: photoScale, opacity: photoOpacity }}
                className="group relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-soft)] shadow-[0_50px_100px_-60px_rgba(0,0,0,0.6)]"
              >
                <motion.div
                  animate={{ y: [-6, 6] }}
                  transition={floatTransition}
                >
                  <Spotlight
                    size={280}
                    className="from-[var(--primary)]/15 via-[var(--surface-soft)] to-transparent opacity-70"
                  />
                  <img
                    src={heroImage}
                    alt="Portrait of Damon, AI researcher and creator"
                    className="h-full w-full object-cover grayscale-[18%] transition duration-700 group-hover:grayscale-0 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </motion.div>
              </motion.div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
});

export default Hero;
