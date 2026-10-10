import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { getFiles, restoreFile } from "../api/files.js";
import EmptyState from "../components/EmptyState.jsx";
import FileCard from "../components/FileCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { pageTransition, revealItem, staggerContainer } from "../utils/motion.js";

const Archive = () => {
  const { setSelectedFile } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getFiles({ status: "archive", limit: 40 });
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

  return (
    <motion.div {...pageTransition}>
      <PageHeader eyebrow="Archive Space" title="Dormant Knowledge" description="Files retained outside the active workspace while preserving metadata, SHA256 identity, and provenance." />
      {loading ? <LoadingState /> : files.length ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {files.map((file) => (
            <motion.div variants={revealItem} key={file._id} className="space-y-3">
              <FileCard file={file} onSelect={setSelectedFile} />
              <button onClick={() => restore(file._id)} className="w-full rounded-2xl bg-success px-4 py-3 font-bold text-void transition hover:brightness-110">Restore to Content Space</button>
            </motion.div>
          ))}
        </motion.div>
      ) : <EmptyState title="Archive is empty" message="Archived files will appear here without losing their contextual relationships." />}
    </motion.div>
  );
};

export default Archive;
