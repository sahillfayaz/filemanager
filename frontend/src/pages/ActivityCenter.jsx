import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Archive, FilePlus, Search, Trash2, Workflow } from "lucide-react";
import { getActivities } from "../api/activity.js";
import ActivityTimeline from "../components/ActivityTimeline.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import WorkspacePanel from "../components/WorkspacePanel.jsx";
import { pageTransition } from "../utils/motion.js";

const filters = [
  { label: "All", value: "all", icon: Activity },
  { label: "Uploads", value: "upload", icon: FilePlus },
  { label: "Archive", value: "archive", icon: Archive },
  { label: "Delete", value: "delete", icon: Trash2 },
  { label: "Search", value: "search", icon: Search },
  { label: "Metadata", value: "metadata", icon: Workflow }
];

const ActivityCenter = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getActivities({ limit: 80 });
      setActivities(data.items || []);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return activities;
    const checks = {
      upload: (action) => action.includes("UPLOADED"),
      archive: (action) => action.includes("ARCHIVED") || action.includes("RESTORED"),
      delete: (action) => action.includes("DELETION") || action.includes("DELETED"),
      search: (action) => action.includes("SEARCHED"),
      metadata: (action) => action.includes("METADATA")
    };
    return activities.filter((activity) => checks[activeFilter]?.(activity.action));
  }, [activeFilter, activities]);

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        eyebrow="Activity Center"
        title="Provenance Timeline"
        description="A chronological trace of uploads, searches, lifecycle transitions, downloads, metadata edits, and deletion events."
      />

      <WorkspacePanel className="mb-6 p-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.value
                  ? "bg-accent text-void shadow-glow"
                  : "bg-white/[0.045] text-white/58 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <filter.icon size={16} />
              {filter.label}
            </button>
          ))}
        </div>
      </WorkspacePanel>

      <WorkspacePanel className="p-5 md:p-6">
        {loading ? <LoadingState /> : filtered.length ? <ActivityTimeline activities={filtered} /> : <EmptyState title="No matching activity" message="Try a different provenance filter." />}
      </WorkspacePanel>
    </motion.div>
  );
};

export default ActivityCenter;
