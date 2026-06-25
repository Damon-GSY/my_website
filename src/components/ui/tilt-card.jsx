import { memo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

const TiltCard = memo(function TiltCard({
  children,
  className = '',
  max = 8,
  perspective = 1000,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(
    mouseY,
    [-0.5, 0.5],
    prefersReducedMotion ? [0, 0] : [-max, max]
  );

  const rotateY = useTransform(
    mouseX,
    [-0.5, 0.5],
    prefersReducedMotion ? [0, 0] : [-max, max]
  );

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30, mass: 0.5 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30, mass: 0.5 });

  const handlePointerMove = useCallback(
    (e) => {
      if (prefersReducedMotion) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const centerX = width / 2;
      const centerY = height / 2;

      mouseX.set((e.clientX - rect.left - centerX) / width);
      mouseY.set((e.clientY - rect.top - centerY) / height);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
      className={className}
      {...props}
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
});

export default TiltCard;
