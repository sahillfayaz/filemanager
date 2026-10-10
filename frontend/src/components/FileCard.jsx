import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Fingerprint } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { formatBytes, formatDate, shortHash } from "../utils/format.js";

const FileCard = ({ file, onSelect }) => {
  const context = file.context || {};
  const tags = context.tags || [];

  return (
    <motion.article
      layout
      whileHover={{ y: -7, scale: 1.012 }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={() => onSelect?.(file)}
      className="group glass-panel relative overflow-hidden rounded-[24px] p-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-accent/8 blur-3xl transition group-hover:bg-primary/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-white/[0.06] text-primary ring-1 ring-white/10">
            <FileText size={22} />
          </div>
          <div className="min-w-0">
            <Link to={`/files/${file._id}`} className="block truncate text-base font-bold text-white transition hover:text-accent">
              {file.originalName}
            </Link>
            <p className="mt-1 text-xs text-white/42">{formatBytes(file.size)} · {file.extension || "file"} · {formatDate(file.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={file.status} />
      </div>

      {file.description && <p className="relative mt-4 line-clamp-2 text-sm leading-6 text-white/52">{file.description}</p>}

      <div className="relative mt-5 grid grid-cols-2 gap-2 text-xs">
        <Signal label="Employee" value={context.employee} />
        <Signal label="Department" value={context.department} />
        <Signal label="Event" value={context.event} />
        <Signal label="Year" value={context.year} />
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full bg-accent/8 px-2.5 py-1 text-xs text-accent ring-1 ring-accent/15">
            {tag}
          </span>
        ))}
        {file.duplicateOf && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary ring-1 ring-primary/20">duplicate</span>}
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-white/38">
          <Fingerprint size={14} className="flex-none text-primary/70" />
          <span className="truncate">{shortHash(file.sha256Hash)}</span>
        </div>
        <Link to={`/files/${file._id}`} className="rounded-full bg-white/[0.05] p-2 text-white/44 transition hover:bg-accent/10 hover:text-accent">
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
};

const Signal = ({ label, value }) => (
  <div className="min-w-0 rounded-2xl bg-white/[0.035] px-3 py-2">
    <p className="text-[0.65rem] uppercase tracking-[0.08em] text-white/32">{label}</p>
    <p className="mt-1 truncate text-white/76">{value || "Unmapped"}</p>
  </div>
);

export default FileCard;
