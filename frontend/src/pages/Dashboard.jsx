import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Archive, Database, Files, HardDrive, Trash2 } from "lucide-react";
import { getDashboardStats } from "../api/dashboard.js";
import { getFiles } from "../api/files.js";
import ActivityTimeline from "../components/ActivityTimeline.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FileCard from "../components/FileCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import WorkspacePanel from "../components/WorkspacePanel.jsx";
import { formatBytes } from "../utils/format.js";
import { pageTransition, revealItem, staggerContainer } from "../utils/motion.js";

const Dashboard = () => {
  const { setSelectedFile, stats, setStats } = useOutletContext();
  const [recentFiles, setRecentFiles] = useState([]);
  const [archiveFiles, setArchiveFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [statsData, contentData, archiveData] = await Promise.all([
        getDashboardStats(),
        getFiles({ status: "content", limit: 4 }),
        getFiles({ status: "archive", limit: 3 })
      ]);
      setStats(statsData);
      setRecentFiles(contentData.items || []);
      setArchiveFiles(archiveData.items || []);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [setStats]);

  if (loading) return <LoadingState />;

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        eyebrow="SIFS Command Surface"
        title="Knowledge Archive"
        description="A context-aware workspace where files are indexed by identity, metadata, activity, and social relationships."
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <motion.div variants={revealItem}><StatCard label="Total Files" value={stats?.totalFiles || 0} icon={Database} accent="accent" subtext="All indexed records" /></motion.div>
        <motion.div variants={revealItem}><StatCard label="Content Space" value={stats?.contentFiles || 0} icon={Files} accent="success" subtext="Active knowledge nodes" /></motion.div>
        <motion.div variants={revealItem}><StatCard label="Archived" value={stats?.archivedFiles || 0} icon={Archive} accent="primary" subtext="Cold but recoverable" /></motion.div>
        <motion.div variants={revealItem}><StatCard label="Storage" value={stats?.totalStorageUsed || 0} icon={HardDrive} accent="danger" formatter={formatBytes} subtext="Local file footprint" /></motion.div>
      </motion.div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.35fr_0.85fr]">
        <WorkspacePanel className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="mono-label text-accent/70">Recent Files</p>
              <h2 className="mt-1 text-xl font-bold text-white">Freshly indexed content</h2>
            </div>
          </div>
          {recentFiles.length ? (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 xl:grid-cols-2">
              {recentFiles.map((file) => (
                <motion.div variants={revealItem} key={file._id}>
                  <FileCard file={file} onSelect={setSelectedFile} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState />
          )}
        </WorkspacePanel>

        <div className="space-y-6">
          <WorkspacePanel className="graph-field relative min-h-[220px] overflow-hidden p-5">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-void/35" />
            <div className="relative">
              <p className="mono-label text-accent/70">Context Graph</p>
              <h2 className="mt-1 text-xl font-bold text-white">Social paths to the same file</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/48">
                Employee, department, event, year, tags, and metadata form parallel retrieval routes.
              </p>
            </div>
            <motion.div
              className="absolute bottom-7 left-7 h-16 w-16 rounded-full bg-accent/14 ring-1 ring-accent/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.72, 1, 0.72] }}
              transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-12 right-12 h-24 w-24 rounded-full bg-primary/12 ring-1 ring-primary/30"
              animate={{ y: [0, -8, 0], scale: [1, 0.96, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </WorkspacePanel>

          <WorkspacePanel className="p-5">
            <p className="mono-label text-primary/70">Activity Overview</p>
            <h2 className="mt-1 text-xl font-bold text-white">Provenance pulse</h2>
            <div className="mt-5">
              {stats?.recentActivities?.length ? <ActivityTimeline activities={stats.recentActivities} dense /> : <EmptyState title="No activity yet" />}
            </div>
          </WorkspacePanel>

          <WorkspacePanel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mono-label text-primary/70">Archive Overview</p>
                <h2 className="mt-1 text-xl font-bold text-white">Dormant records</h2>
              </div>
              <Trash2 className="text-white/22" />
            </div>
            <div className="mt-4 space-y-3">
              {archiveFiles.map((file) => (
                <button key={file._id} onMouseEnter={() => setSelectedFile(file)} className="w-full rounded-2xl bg-white/[0.035] px-4 py-3 text-left transition hover:bg-primary/10">
                  <p className="truncate text-sm font-semibold text-white">{file.originalName}</p>
                  <p className="mt-1 text-xs text-white/38">{file.context?.department || "Unmapped"} · {file.context?.year || "No year"}</p>
                </button>
              ))}
              {!archiveFiles.length && <p className="text-sm text-white/42">Archive space is quiet.</p>}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
