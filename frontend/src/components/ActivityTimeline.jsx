import { motion } from "framer-motion";
import { Archive, Download, FilePlus, RotateCcw, Search, Trash2, Workflow } from "lucide-react";
import { formatDate, titleCase } from "../utils/format.js";

const iconMap = {
  FILE_UPLOADED: FilePlus,
  DUPLICATE_FILE_UPLOADED: FilePlus,
  FILE_ARCHIVED: Archive,
  FILE_RESTORED: RotateCcw,
  FILE_MOVED_TO_DELETION: Trash2,
  FILE_PERMANENTLY_DELETED: Trash2,
  FILE_DOWNLOADED: Download,
  FILE_SEARCHED: Search,
  HASH_SEARCHED: Search,
  METADATA_CREATED: Workflow,
  METADATA_UPDATED: Workflow,
  METADATA_DELETED: Workflow
};

const ActivityTimeline = ({ activities = [], dense = false }) => {
  return (
    <div className="relative space-y-3">
      <div className="absolute bottom-4 left-5 top-4 w-px bg-gradient-to-b from-accent/50 via-white/10 to-primary/40" />
      {activities.map((activity, index) => {
        const Icon = iconMap[activity.action] || Workflow;
        return (
          <motion.div
            key={activity._id || index}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.045, type: "spring", stiffness: 180, damping: 22 }}
            className="relative flex gap-4"
          >
            <div className="z-10 grid h-10 w-10 flex-none place-items-center rounded-2xl bg-surface text-accent ring-1 ring-accent/25 shadow-glow">
              <Icon size={16} />
            </div>
            <div className={`glass-panel flex-1 rounded-[18px] ${dense ? "p-3" : "p-4"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{activity.message}</p>
                <span className="font-mono text-[0.68rem] text-white/36">{formatDate(activity.createdAt)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-primary">{titleCase(activity.action)}</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-white/44">{activity.entityType}</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-white/44">{activity.performedBy}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
