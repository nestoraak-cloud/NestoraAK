import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Pointer-driven 3D tilt. Outer div sets the perspective; the inner card
// rotates toward the cursor with a spring. Touch is ignored so it never
// fights horizontal swipes on the carousel.
export default function Tilt({ children, max = 9, className = '', innerClassName = '', ...rest }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 20 });
  const sy = useSpring(y, { stiffness: 220, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [max, -max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-max, max]);

  function onMove(e) {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className={className} style={{ perspective: 900 }} {...rest}>
      <motion.div
        className={innerClassName}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}
