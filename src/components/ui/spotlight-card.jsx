import { memo, useCallback } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

const SpotlightCard = memo(function SpotlightCard({
  children,
  className = '',
  gradientSize = 320,
  as = 'article',
  ...props
}) {
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  const handlePointerMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(-200);
    mouseY.set(-200);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, rgba(201,100,66,0.08), transparent 70%)`;

  const Tag = as;

  return (
    <Tag
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-shadow hover:[box-shadow:0_0_0_1px_var(--ring-strong)] ${className}`}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background }}
      />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
});

export default SpotlightCard;
