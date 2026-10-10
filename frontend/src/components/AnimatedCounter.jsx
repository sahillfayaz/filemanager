import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

const AnimatedCounter = ({ value = 0, formatter = (v) => Math.round(v).toLocaleString() }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, formatter);

  useEffect(() => {
    const controls = animate(count, Number(value) || 0, {
      duration: 1.15,
      ease: [0.22, 1, 0.36, 1]
    });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
};

export default AnimatedCounter;
