import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  FileText,
  Github,
  Mail,
  Minimize2,
  Radio,
  Search,
} from 'lucide-react';
import BorderBeam from './ui/border-beam';

const quickActions = [
  { label: 'Email', href: 'mailto:hello@damon.ai', icon: Mail, external: true },
  { label: 'Work', to: '/projects', icon: BriefcaseBusiness },
  { label: 'Notes', to: '/blog', icon: FileText },
  { label: 'GitHub', href: 'https://github.com/Damon-GSY', icon: Github, external: true },
];

const statusRows = [
  { label: 'Current loop', value: 'agent eval taxonomy' },
  { label: 'Production focus', value: 'tool-use reliability' },
  { label: 'Open channel', value: 'research / systems' },
];

const signals = [
  { label: 'rl', value: 'active' },
  { label: 'eval', value: '42 axes' },
  { label: 'ship', value: 'ready' },
];

function ActionItem({ action }) {
  const Icon = action.icon;
  const className =
    'group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10 active:scale-[0.98]';

  const content = (
    <>
      <span className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/25">
          <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
        </span>
        <span className="text-sm font-semibold text-white/90">{action.label}</span>
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/35 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--primary)]" />
    </>
  );

  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={action.href} target={action.external && !action.href.startsWith('mailto:') ? '_blank' : undefined} rel={action.external ? 'noreferrer' : undefined} className={className}>
      {content}
    </a>
  );
}

export default function FloatingWindow() {
  const location = useLocation();
  const launcherRef = useRef(null);
  const closeButtonRef = useRef(null);
  const wasOpenRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [contactHidden, setContactHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileInFlow, setMobileInFlow] = useState(false);
  const [mobileHidden, setMobileHidden] = useState(false);
  const reducedMotion = useReducedMotion();
  const hidden = contactHidden || (isMobile && mobileHidden);
  const compact = isMobile && mobileInFlow && !hidden;
  const panelOpen = open && !hidden;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (hidden) return;
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hidden]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll('[data-hide-launcher]'));
    setContactHidden(false);
    if (!zones.length) return undefined;

    const visibleZones = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleZones.add(entry.target);
          else visibleZones.delete(entry.target);
        });
        setContactHidden(visibleZones.size > 0);
      },
      { rootMargin: '-12% 0px -12% 0px', threshold: 0 },
    );
    zones.forEach((zone) => io.observe(zone));
    return () => io.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    setMobileInFlow(false);
    setMobileHidden(false);
    if (!isMobile) return undefined;

    const flow = document.querySelector('[data-compact-mobile-launcher]');
    const hiddenZones = Array.from(
      document.querySelectorAll('[data-hide-mobile-launcher]'),
    );
    const visibleHiddenZones = new Set();

    const flowObserver = flow
      ? new IntersectionObserver(
          ([entry]) => setMobileInFlow(Boolean(entry?.isIntersecting)),
          { rootMargin: '-8% 0px -8% 0px', threshold: 0 },
        )
      : null;

    const hiddenObserver = hiddenZones.length
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) visibleHiddenZones.add(entry.target);
              else visibleHiddenZones.delete(entry.target);
            });
            setMobileHidden(visibleHiddenZones.size > 0);
          },
          { rootMargin: '-8% 0px -8% 0px', threshold: 0 },
        )
      : null;

    if (flow && flowObserver) flowObserver.observe(flow);
    hiddenZones.forEach((zone) => hiddenObserver?.observe(zone));

    return () => {
      flowObserver?.disconnect();
      hiddenObserver?.disconnect();
    };
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (hidden || compact) setOpen(false);
  }, [compact, hidden]);

  useEffect(() => {
    let focusFrame;

    if (panelOpen) {
      focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (!hidden) {
        focusFrame = window.requestAnimationFrame(() => launcherRef.current?.focus());
      }
    }

    return () => {
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
    };
  }, [hidden, panelOpen]);

  return (
    <motion.div
      animate={reducedMotion ? undefined : { opacity: hidden ? 0 : 1, y: hidden ? 16 : 0, scale: hidden ? 0.96 : 1 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      style={{ pointerEvents: hidden ? 'none' : 'auto', ...(reducedMotion && { opacity: hidden ? 0 : 1 }) }}
      className={`fixed z-40 flex max-w-[calc(100vw-1rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5 sm:max-w-[calc(100vw-2rem)] ${
        compact ? 'bottom-2 right-2' : 'bottom-3 right-3'
      }`}
      aria-hidden={hidden}
      inert={hidden}
      data-launcher-mode={hidden ? 'hidden' : compact ? 'compact' : 'full'}
    >
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            key="floating-window"
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96, filter: 'blur(8px)' }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.97, filter: 'blur(8px)' }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[min(72dvh,34rem)] w-[min(23rem,calc(100vw-1.5rem))] overflow-y-auto rounded-[1.45rem] border border-white/10 bg-[#0d0d10]/88 p-1.5 shadow-[0_18px_64px_-42px_rgba(217,119,87,0.65)] backdrop-blur-2xl sm:w-[min(25rem,calc(100vw-2rem))] sm:rounded-[1.7rem]"
            role="dialog"
            aria-label="Agent desk quick panel"
          >
            <BorderBeam size={130} duration={8} delay={0.4} className="hidden opacity-75 sm:block" />
            <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.02))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                    <Bot className="h-4 w-4 text-[var(--primary)]" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--primary)] opacity-50 animate-ping" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
                  </span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
                      agent desk
                    </p>
                    <p className="text-sm font-semibold text-white">Damon control surface</p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition-colors hover:border-[var(--primary)]/50 hover:text-white"
                  aria-label="Collapse agent desk"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid gap-3 p-4">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-3">
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={reducedMotion ? undefined : { x: ['-120%', '720%'] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-[var(--primary)]" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                        index
                      </span>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                      cmd k
                    </span>
                  </div>
                  <p className="relative mt-3 text-sm leading-6 text-white/68">
                    Agent systems, post-training notes, production traces, and
                    contact routes in one compact control surface.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <ActionItem key={action.label} action={action} />
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20">
                  {statusRows.map((row, index) => (
                    <motion.div
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-white/10 px-3 py-2.5 last:border-b-0"
                      animate={reducedMotion ? undefined : { opacity: [0.62, 1, 0.62] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.22, ease: 'easeInOut' }}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                        {row.label}
                      </span>
                      <span className="max-w-[12rem] truncate text-right text-xs font-semibold text-white/75">
                        {row.value}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {signals.map((signal, index) => (
                    <motion.div
                      key={signal.label}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                      animate={reducedMotion ? undefined : { y: [0, -2, 0], borderColor: ['rgba(255,255,255,0.1)', 'rgba(217,119,87,0.42)', 'rgba(255,255,255,0.1)'] }}
                      transition={{ duration: 2.6, repeat: Infinity, delay: index * 0.28, ease: 'easeInOut' }}
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                        {signal.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/85">{signal.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        onClick={() => {
          if (!hidden) setOpen((value) => !value);
        }}
        whileTap={{ scale: 0.97 }}
        className={`group flex items-center gap-2 rounded-full border border-white/10 bg-[#111114]/88 text-white backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--primary)]/50 hover:bg-[#151519] sm:p-1.5 sm:pr-3 sm:shadow-[0_18px_60px_-30px_rgba(217,119,87,0.8)] ${
          compact
            ? 'h-9 w-9 justify-center p-0 shadow-[0_8px_28px_-20px_rgba(217,119,87,0.72)]'
            : 'p-1 pr-1 shadow-[0_12px_42px_-28px_rgba(217,119,87,0.8)]'
        }`}
        aria-expanded={panelOpen}
        aria-label={panelOpen ? 'Close agent desk' : 'Open agent desk'}
        disabled={hidden}
        tabIndex={hidden ? -1 : 0}
      >
        <motion.span
          className={`flex items-center justify-center rounded-full bg-[var(--primary)] text-[#130907] sm:h-9 sm:w-9 ${
            compact ? 'h-7 w-7' : 'h-8 w-8'
          }`}
          animate={reducedMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          {panelOpen ? <Minimize2 className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
        </motion.span>
        <span className="hidden flex-col items-start sm:flex">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/42">
            cmd · k
          </span>
          <span className="text-xs font-semibold text-white/88">
            {panelOpen ? 'Close desk' : 'Agent desk'}
          </span>
        </span>
        <Activity className="hidden h-3.5 w-3.5 text-[var(--primary)] sm:block" />
      </motion.button>
    </motion.div>
  );
}
