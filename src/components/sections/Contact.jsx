import { motion } from 'framer-motion';
import { Mail, Linkedin, Youtube, Github } from 'lucide-react';
import MagneticButton from '../MagneticButton';
import AuroraBackground from '../ui/aurora-background';

// Bilibili has no lucide glyph — a compact stroke mark (TV + antennae + eyes)
// kept in the same weight as the lucide brand icons so the strip reads uniform.
function BilibiliMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7.5 3.5 10 6M16.5 3.5 14 6" />
      <rect x="3" y="7" width="18" height="13" rx="3.5" />
      <path d="M9 12h0M15 12h0" strokeWidth="2.6" />
    </svg>
  );
}

const channels = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shengyue-guan-1a7b3226b/', Mark: Linkedin },
  { label: 'GitHub', href: 'https://github.com/Damon-GSY', Mark: Github },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA', Mark: Youtube },
  { label: 'Bilibili', href: 'https://space.bilibili.com/358541297', Mark: BilibiliMark },
  { label: 'Email', href: 'mailto:hello@damon.ai', Mark: Mail },
];

function ChannelStrip() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-1">
      {channels.map((item) => {
        const { label, href } = item;
        const Mark = item.Mark;
        const external = href.startsWith('http');
        return (
          <li key={label}>
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              className="group relative flex h-11 items-center gap-2 rounded-full border border-transparent px-3.5 text-[var(--muted)] transition-colors duration-300 hover:border-[var(--line)] hover:bg-[var(--surface)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              aria-label={label}
            >
              <Mark className="h-4 w-4 transition-colors duration-300" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100">
                {label}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function Contact() {
  return (
    <section
      id="contact"
      data-hide-launcher
      className="border-t border-[var(--line)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
        >
          <AuroraBackground />

          <div className="relative p-8 text-center md:p-14">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)]">
              [05] initiate_contact
            </p>
            <h2 className="font-display text-balance text-4xl font-medium tracking-tight text-[var(--text)] md:text-6xl">
              Let&rsquo;s build something
              <br />
              worth <span className="text-[var(--primary)]">shipping.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm text-[var(--muted)] md:text-base">
              Open to collaborations on agent systems, evaluation research,
              and AI content production.
            </p>

            <div className="mt-8 flex justify-center">
              <MagneticButton strength={0.4}>
                <a
                  href="mailto:hello@damon.ai"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-strong)] active:scale-[0.97]"
                >
                  <Mail className="h-4 w-4" />
                  hello@damon.ai
                </a>
              </MagneticButton>
            </div>

            <div className="mt-12 border-t border-[var(--line)] pt-8">
              <p className="mb-5 text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--muted)]">
                Elsewhere
              </p>
              <ChannelStrip />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
