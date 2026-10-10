import { motion } from "framer-motion";

const LoadingState = ({ label = "Synchronizing archive..." }) => {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="text-center">
        <motion.div
          className="mx-auto h-14 w-14 rounded-full border border-accent/30 border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-5 text-sm text-white/50">{label}</p>
      </div>
    </div>
  );
};

export default LoadingState;
