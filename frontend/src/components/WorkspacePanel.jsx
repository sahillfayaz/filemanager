import { motion } from "framer-motion";

const WorkspacePanel = ({ children, className = "", ...props }) => {
  return (
    <motion.section
      layout
      className={`glass-panel rounded-[24px] ${className}`}
      transition={{ type: "spring", stiffness: 170, damping: 24 }}
      {...props}
    >
      {children}
    </motion.section>
  );
};

export default WorkspacePanel;
