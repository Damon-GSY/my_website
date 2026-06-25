import { motion } from 'framer-motion';
import FootprintMap from './ui/footprint-map';

// Footer is the page's quiet closing signature — not a second nav.
// (consensus with Codex: strip nav/email/back-to-top; one hairline strip with a
// compact real-geography footprint + presence + copyright.)
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-hide-launcher className="relative border-t border-[var(--line)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          variants={fadeUp}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-col gap-7 py-10 md:flex-row md:items-center md:gap-12 md:py-12"
        >
          {/* Compact footprint map — real geography, amber base ping */}
          <div className="w-full max-w-[176px] shrink-0 overflow-hidden rounded-xl border border-[var(--line)]">
            <FootprintMap compact className="bg-[var(--surface)]" />
          </div>

          {/* Presence line */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--primary)]">
                presence
              </p>
            </div>
            <p className="mt-2.5 text-sm text-[var(--text)]">
              Asia / Shanghai{' '}
              <span className="font-mono text-[var(--muted)]">UTC+8</span> · AI/LLM
              systems at Alibaba
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-[var(--muted)]">
              © {year} Shengyue Guan — built with React · GSAP · Tailwind
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
