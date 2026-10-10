import { motion } from "framer-motion";
import { Database } from "lucide-react";

const EmptyState = ({ title = "Nothing indexed yet", message = "Upload or search files to populate this workspace." }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel flex min-h-[260px] flex-col items-center justify-center rounded-[24px] p-8 text-center"
    >
      <div className="rounded-3xl bg-accent/10 p-4 text-accent ring-1 ring-accent/20">
        <Database size={28} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-white/48">{message}</p>
    </motion.div>
  );
};

export default EmptyState;
