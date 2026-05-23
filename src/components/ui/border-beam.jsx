import { motion } from 'framer-motion';

export default function BorderBeam({
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = 'var(--primary)',
  colorTo = 'var(--primary-strong)',
  className = '',
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden ${className}`}>
      <motion.div
        className="absolute"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${colorFrom}, ${colorTo}, transparent)`,
          borderRadius: '50%',
          filter: 'blur(6px)',
        }}
        animate={{
          x: ['0%', '200%', '200%', '0%', '0%'],
          y: ['0%', '0%', '200%', '200%', '0%'],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow: 'inset 0 0 0 1px var(--line)',
        }}
      />
    </div>
  );
}
