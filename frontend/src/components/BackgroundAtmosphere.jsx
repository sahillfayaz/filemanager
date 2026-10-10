import { motion } from "framer-motion";

const BackgroundAtmosphere = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-radial-field noise">
      <motion.div
        className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-accent/12 blur-3xl"
        animate={{ x: [0, 48, 12, 0], y: [0, 22, 56, 0], scale: [1, 1.15, 0.96, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-10rem] top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [0, -34, -12, 0], y: [0, 52, -16, 0], scale: [1, 0.92, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </div>
  );
};

export default BackgroundAtmosphere;
