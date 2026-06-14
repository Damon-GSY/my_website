import { useRef, useCallback } from 'react';
import gsap from 'gsap';

export default function MagneticButton({ children, className = '', strength = 0.3, ...props }) {
  const ref = useRef(null);
  const tweenRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      if (tweenRef.current) tweenRef.current.kill();
      tweenRef.current = gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    if (tweenRef.current) tweenRef.current.kill();
    tweenRef.current = gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  }, []);

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </span>
  );
}
