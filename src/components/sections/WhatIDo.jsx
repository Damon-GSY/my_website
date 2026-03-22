import { forwardRef } from 'react';
import {
  BrainCircuit,
  Network,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const spring = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
  mass: 0.8,
};

const cards = [
  {
    id: 'research',
    title: 'Research Systems',
    eyebrow: 'Research',
    description:
      'I design agent environments and evaluation loops for multi-step reasoning tasks.',
    className: 'md:col-span-2',
    icon: BrainCircuit,
    order: 0,
    tone: 'main',
    accent: 'cyan',
    cta: { label: 'Explore research', href: '/about' },
  },
  {
    id: 'stack',
    title: 'Stack',
    eyebrow: 'Core Stack',
    description: 'Core tools for building agent systems and production-ready AI workflows.',
    className: 'md:col-span-1',
    icon: Network,
    order: 2,
    tone: 'sub',
    accent: 'violet',
    cta: { label: 'View stack', href: '#whatido' },
  },
  {
    id: 'build',
    title: 'Build & Deployment',
    eyebrow: 'Engineering',
    description:
      'I ship research into production workflows with clear guardrails, speed, and reliability.',
    className: 'md:col-span-2',
    icon: Wrench,
    order: 1,
    tone: 'main',
    accent: 'amber',
    cta: { label: 'See delivery model', href: '/about' },
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    eyebrow: 'Principle',
    description:
      'Build practical intelligence first. Elegant systems should make hard decisions easier.',
    className: 'md:col-span-1',
    icon: Sparkles,
    order: 3,
    tone: 'sub',
    accent: 'emerald',
    cta: { label: 'Read principle', href: '/about' },
  },
];

const accentStyles = {
  cyan: {
    chip: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    iconWrap:
      'border-cyan-200 bg-cyan-50 text-cyan-700 group-hover:border-cyan-300 group-hover:bg-cyan-100',
    icon: 'text-cyan-700',
    hoverBorder: 'hover:border-cyan-300',
    glow: 'bg-[radial-gradient(circle_at_86%_8%,rgba(34,211,238,0.18),transparent_42%)]',
    ctaBg: '#b9ebf6',
    ctaFg: '#0e5f79',
  },
  violet: {
    chip: 'border-violet-200 bg-violet-50 text-violet-700',
    iconWrap:
      'border-violet-200 bg-violet-50 text-violet-700 group-hover:border-violet-300 group-hover:bg-violet-100',
    icon: 'text-violet-700',
    hoverBorder: 'hover:border-violet-300',
    glow: 'bg-[radial-gradient(circle_at_86%_8%,rgba(167,139,250,0.18),transparent_42%)]',
    ctaBg: '#ded3ff',
    ctaFg: '#5a2ec9',
  },
  amber: {
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    iconWrap:
      'border-amber-200 bg-amber-50 text-amber-700 group-hover:border-amber-300 group-hover:bg-amber-100',
    icon: 'text-amber-700',
    hoverBorder: 'hover:border-amber-300',
    glow: 'bg-[radial-gradient(circle_at_86%_8%,rgba(251,191,36,0.18),transparent_42%)]',
    ctaBg: '#fde3b0',
    ctaFg: '#8b4f00',
  },
  emerald: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    iconWrap:
      'border-emerald-200 bg-emerald-50 text-emerald-700 group-hover:border-emerald-300 group-hover:bg-emerald-100',
    icon: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-300',
    glow: 'bg-[radial-gradient(circle_at_86%_8%,rgba(16,185,129,0.18),transparent_42%)]',
    ctaBg: '#c9f2e2',
    ctaFg: '#0f6b4a',
  },
};

function StackBackground({ reduceMotion }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-8 top-8 h-18 w-44 rounded-full bg-cyan-200/45 blur-2xl"
        animate={reduceMotion ? undefined : { x: [-10, 12, -10] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

const WhatIDo = forwardRef(function WhatIDo(props, ref) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="w-full bg-[linear-gradient(180deg,#ffffff_0%,#f7fcff_100%)] py-16 lg:py-24"
      id="whatido"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
            What I Do
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[290px]">
          {cards.map((card) => {
            const Icon = card.icon;
            const mainTone = card.tone === 'main';
            const accent = accentStyles[card.accent];

            return (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.42,
                  delay: card.order * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : mainTone
                      ? { y: -6, scale: 1.013 }
                      : { y: -4, scale: 1.01 }
                }
                className={`group relative overflow-hidden rounded-2xl border border-zinc-200/85 bg-white p-6 md:p-7 shadow-[0_22px_45px_-35px_rgba(15,23,42,0.45)] transition-colors duration-300 ${accent.hoverBorder} ${card.className}`}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] ${accent.chip}`}>
                      {card.eyebrow}
                    </span>
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${accent.iconWrap}`}
                    >
                      <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${accent.icon}`} />
                    </div>
                  </div>

                  <h3
                    className={`font-semibold tracking-tight text-zinc-950 ${
                      card.id === 'stack' ? 'text-2xl md:text-[2.35rem]' : 'text-2xl md:text-3xl'
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`mt-3 max-w-xl leading-relaxed text-zinc-600 ${
                      card.id === 'stack' ? 'text-[0.96rem]' : 'text-sm'
                    }`}
                  >
                    {card.description}
                  </p>

                  <a
                    href={card.cta.href}
                    className="card-cta mt-auto"
                    style={{
                      '--cta-bg': accent.ctaBg,
                      '--cta-fg': accent.ctaFg,
                    }}
                  >
                    <span className="card-cta-label">{card.cta.label}</span>
                    <svg className="card-cta-arrow" width="15" height="10" viewBox="0 0 13 10" aria-hidden="true">
                      <path d="M1,5 L11,5" />
                      <polyline points="8 1 12 5 8 9" />
                    </svg>
                  </a>
                </div>

                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className={`absolute inset-0 ${accent.glow}`} />
                </div>

                {card.id === 'stack' ? <StackBackground reduceMotion={reduceMotion} /> : null}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default WhatIDo;
