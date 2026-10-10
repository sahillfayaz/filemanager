import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { getFiles, permanentDelete, restoreFile } from "../api/files.js";
import EmptyState from "../components/EmptyState.jsx";
import FileCard from "../components/FileCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { pageTransition, revealItem, staggerContainer } from "../utils/motion.js";

const DeletionSpace = () => {
  const { setSelectedFile } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getFiles({ status: "deletion", limit: 40 });
    setFiles(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const restore = async (id) => {
    await restoreFile(id);
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm("Permanently delete this file, its metadata, and its context? This cannot be undone.")) return;
    await permanentDelete(id);
    await load();
  };

  return (
    <motion.div {...pageTransition}>
      <PageHeader eyebrow="Deletion Space" title="Recovery Boundary" description="Soft-deleted files wait here before permanent removal from storage and metadata collections." />
      {loading ? <LoadingState /> : files.length ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {files.map((file) => (
            <motion.div variants={revealItem} key={file._id} className="space-y-3">
              <FileCard file={file} onSelect={setSelectedFile} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => restore(file._id)} className="rounded-2xl bg-success px-4 py-3 font-bold text-void transition hover:brightness-110">Restore</button>
                <button onClick={() => remove(file._id)} className="rounded-2xl bg-danger px-4 py-3 font-bold text-white shadow-danger transition hover:brightness-110">Delete Forever</button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : <EmptyState title="Deletion space is clear" message="Files moved to deletion space will appear here for final review." />}
    </motion.div>
  );
};

export default DeletionSpace;
