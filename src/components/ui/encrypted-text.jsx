import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#________';

/**
 * Aceternity-style "Encrypted Text" effect.
 *
 * Reveals the real `text` gradually by cycling each character through random
 * gibberish, progressively locking each position to its target character over
 * `maxIterations` passes. Great for AI/agent headlines.
 *
 * Renders the tag specified by `as` (defaults to `span`) so it can be dropped
 * inline or used as a heading. Honors `prefers-reduced-motion` by rendering the
 * final text immediately with no animation.
 */
export default function EncryptedText({
  text = '',
  className = '',
  speed = 50,
  maxIterations = 10,
  characters = DEFAULT_CHARACTERS,
  as = 'span',
  animateOnInView = true,
}) {
  const Component = as;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);

  const shouldAnimate = text.length > 0 && !prefersReducedMotion && (!animateOnInView || inView);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplay(text);
      return;
    }

    let iteration = 0;
    let intervalId;

    const randomChar = () => characters[Math.floor(Math.random() * characters.length)];

    intervalId = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, idx) => {
            // Spaces and non-visible chars stay as-is so words don't collapse.
            if (char === ' ') return ' ';
            // Position already "decrypted" — lock to target.
            if (idx < iteration) return text[idx];
            return randomChar();
          })
          .join(''),
      );

      iteration += 1 / 3;

      if (iteration >= text.length + maxIterations) {
        clearInterval(intervalId);
        setDisplay(text);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [shouldAnimate, text, speed, maxIterations, characters]);

  return (
    <Component ref={ref} className={className} aria-label={text}>
      {display}
    </Component>
  );
}
