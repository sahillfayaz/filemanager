import { motion } from "framer-motion";

const PageHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow && <p className="mono-label text-primary/75">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52 md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </motion.header>
  );
};

export default PageHeader;
