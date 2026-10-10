import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter.jsx";

const StatCard = ({ label, value, icon: Icon, accent = "accent", formatter, subtext }) => {
  const colorMap = {
    accent: "text-accent shadow-glow",
    primary: "text-primary shadow-gold",
    success: "text-success",
    danger: "text-danger shadow-danger"
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -6, scale: 1.015 }}
      className="glass-panel relative overflow-hidden rounded-[22px] p-5"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04] blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono-label text-white/38">{label}</p>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            <AnimatedCounter value={value} formatter={formatter} />
          </div>
        </div>
        {Icon && (
          <div className={`rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10 ${colorMap[accent]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {subtext && <p className="mt-4 text-sm text-white/48">{subtext}</p>}
    </motion.div>
  );
};

export default StatCard;
