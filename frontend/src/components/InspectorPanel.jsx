import { motion } from "framer-motion";
import { Activity, Binary, Braces, Network, ShieldCheck } from "lucide-react";
import { formatBytes, shortHash } from "../utils/format.js";

const InspectorPanel = ({ selectedFile, stats }) => {
  const context = selectedFile?.context;
  const metadata = selectedFile?.metadata || [];

  return (
    <aside className="hidden xl:fixed xl:inset-y-0 xl:right-0 xl:z-20 xl:block xl:w-[340px] xl:border-l xl:border-white/[0.07] xl:bg-void/64 xl:px-5 xl:py-6 xl:backdrop-blur-2xl">
      <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="flex h-full flex-col gap-5">
        <div>
          <p className="mono-label text-accent/70">Metadata Inspector</p>
          <h2 className="mt-2 text-xl font-bold text-white">Context Signals</h2>
        </div>

        {selectedFile ? (
          <div className="space-y-4">
            <div className="glass-panel rounded-[22px] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                  <Binary size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{selectedFile.originalName}</p>
                  <p className="mt-1 text-xs text-white/45">{formatBytes(selectedFile.size)} · {selectedFile.mimeType}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-black/24 p-3 font-mono text-xs text-primary/80">
                {shortHash(selectedFile.sha256Hash)}
              </div>
            </div>

            <div className="glass-panel rounded-[22px] p-4">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Network size={16} className="text-primary" />
                <span className="text-sm font-semibold">Context Map</span>
              </div>
              <div className="space-y-2 text-sm">
                {["employee", "department", "event", "year", "category"].map((key) => (
                  <div key={key} className="flex justify-between gap-4 rounded-xl bg-white/[0.035] px-3 py-2">
                    <span className="capitalize text-white/42">{key}</span>
                    <span className="truncate text-white/82">{context?.[key] || "Unmapped"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[22px] p-4">
              <div className="mb-4 flex items-center gap-2 text-white">
                <Braces size={16} className="text-accent" />
                <span className="text-sm font-semibold">Metadata</span>
              </div>
              <div className="space-y-2">
                {metadata.slice(0, 6).map((item) => (
                  <div key={item._id} className="rounded-xl bg-white/[0.035] px-3 py-2">
                    <p className="text-xs text-white/38">{item.key}</p>
                    <p className="truncate text-sm text-white/78">{item.value}</p>
                  </div>
                ))}
                {metadata.length === 0 && <p className="text-sm text-white/42">No metadata records attached.</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-[24px] p-5">
            <ShieldCheck className="text-primary" size={24} />
            <p className="mt-4 text-sm leading-6 text-white/52">
              Select a file to inspect its contexts, hash identity, metadata records, and archive status.
            </p>
          </div>
        )}

        <div className="mt-auto glass-panel rounded-[22px] p-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-success" />
            <p className="text-sm font-semibold text-white">System Pulse</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-white/[0.035] p-3">
              <p className="text-2xl font-bold text-white">{stats?.totalFiles ?? 0}</p>
              <p className="text-xs text-white/38">files</p>
            </div>
            <div className="rounded-2xl bg-white/[0.035] p-3">
              <p className="text-2xl font-bold text-primary">{stats?.archivedFiles ?? 0}</p>
              <p className="text-xs text-white/38">archived</p>
            </div>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};

export default InspectorPanel;
