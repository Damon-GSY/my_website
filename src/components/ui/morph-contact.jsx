import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { X, Mail, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(Flip);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MORPH_DURATION = 0.5;

/**
 * MorphContact
 *
 * Wraps a trigger element (typically the hero CTA). On click, the trigger's
 * rect is recorded via `gsap Flip.getState`, then a centered overlay card is
 * mounted and Flip animates from the trigger's old rect into the card's
 * natural rect (spring/elastic ease). On close, the inverse: the card's rect
 * is recorded, the overlay is hidden, and Flip morphs back into the trigger.
 *
 * Reduced motion: skip Flip entirely, toggle visibility instantly.
 *
 * Accessibility:
 *  - Esc closes the overlay
 *  - The overlay card receives focus on open
 *  - aria-modal + role="dialog" + labelledby
 *  - Click on backdrop closes
 */
export default function MorphContact({
  children,
  triggerClassName = '',
  triggerAriaLabel = 'Open contact overlay',
  email = 'hello@damon.ai',
}) {
  const triggerRef = useRef(null);
  const cardRef = useRef(null);
  const backdropRef = useRef(null);
  const [open, setOpen] = useState(false);
  const flipStateRef = useRef(null);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Capture trigger rect BEFORE React renders the overlay, so Flip has a
  // valid "from" snapshot of the trigger's resting position.
  const handleTriggerClick = useCallback((e) => {
    e.preventDefault();
    if (!triggerRef.current) return;

    if (!prefersReducedMotion()) {
      flipStateRef.current = Flip.getState(triggerRef.current);
    }
    setOpen(true);
  }, []);

  // Open transition: morph trigger rect -> card rect.
  useLayoutEffect(() => {
    if (!open) return;
    if (prefersReducedMotion()) {
      cardRef.current?.focus();
      return;
    }

    const state = flipStateRef.current;
    if (!state || !cardRef.current) {
      cardRef.current?.focus();
      return;
    }

    const ctx = gsap.context(() => {
      // Fade backdrop in sync with the morph.
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: MORPH_DURATION, ease: 'power2.out' }
      );
      // Card content fades in slightly delayed for a refined feel.
      gsap.fromTo(
        cardRef.current?.querySelectorAll('[data-card-content] > *'),
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          stagger: 0.05,
          delay: 0.18,
        }
      );
      // The actual flip: animate from the trigger's recorded rect.
      Flip.from(state, {
        targets: cardRef.current,
        absolute: true,
        duration: MORPH_DURATION,
        ease: 'elastic.out(1, 0.6)',
        onComplete: () => cardRef.current?.focus(),
      });
    });

    return () => ctx.revert();
  }, [open]);

  // Close transition: morph card rect -> trigger rect.
  const handleClose = useCallback(() => {
    if (!triggerRef.current) {
      setOpen(false);
      return;
    }

    if (prefersReducedMotion()) {
      setOpen(false);
      triggerRef.current.focus?.();
      return;
    }

    // Capture card rect, hide, then Flip back to trigger.
    flipStateRef.current = Flip.getState(cardRef.current);
    setOpen(false);
  }, []);

  // After close, animate the recorded card state back into the trigger.
  useLayoutEffect(() => {
    if (open) return;
    const state = flipStateRef.current;
    if (!state || !triggerRef.current || prefersReducedMotion()) {
      flipStateRef.current = null;
      return;
    }
    flipStateRef.current = null;

    const ctx = gsap.context(() => {
      Flip.from(state, {
        targets: triggerRef.current,
        absolute: true,
        duration: MORPH_DURATION,
        ease: 'elastic.out(1, 0.6)',
        onComplete: () => triggerRef.current?.focus?.(),
      });
    });

    return () => ctx.revert();
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        aria-label={triggerAriaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClassName}
      >
        {children}
      </button>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="presentation"
          onClick={handleClose}
        >
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="morph-contact-heading"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(92vw,440px)] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 md:p-9 shadow-2xl outline-none"
            style={{ '--tw-shadow-color': 'rgba(0,0,0,0.5)' }}
          >
            {/* Subtle accent glow, editorial restraint */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-px left-7 right-7 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-70"
            />

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close contact overlay"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div data-card-content className="flex flex-col">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[var(--primary)] mb-3">
                [contact]
              </p>
              <h2
                id="morph-contact-heading"
                className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[var(--text)]"
              >
                Get in touch
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Open to collaborations on agent systems, evaluation research,
                and AI content production.
              </p>

              <a
                href={`mailto:${email}`}
                className="mt-6 inline-flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {email}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <p className="mt-4 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                Hangzhou · available for work
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
