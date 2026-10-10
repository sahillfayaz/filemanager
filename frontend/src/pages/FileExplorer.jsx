import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { getFiles } from "../api/files.js";
import { searchByContext, searchFiles } from "../api/search.js";
import EmptyState from "../components/EmptyState.jsx";
import FileCard from "../components/FileCard.jsx";
import FileUploadPanel from "../components/FileUploadPanel.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import SearchFilters from "../components/SearchFilters.jsx";
import { pageTransition, revealItem, staggerContainer } from "../utils/motion.js";

const defaultFilters = { query: "", status: "content", employee: "", department: "", event: "", year: "", category: "" };

const FileExplorer = () => {
  const { setSelectedFile } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFiles = async (status = filters.status) => {
    setLoading(true);
    setError("");
    try {
      const data = await getFiles({ status, limit: 30 });
      setFiles(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles("content");
  }, []);

  const runSearch = async () => {
    if (!filters.query.trim()) {
      await loadFiles(filters.status);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setFiles(await searchFiles({ query: filters.query, status: filters.status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runContextSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      setFiles(await searchByContext(params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onUploaded = (file) => {
    setFiles((current) => [file, ...current]);
    setSelectedFile(file);
  };

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        eyebrow="Content Space"
        title="File Explorer"
        description="Search through file name, context fields, flexible metadata, tags, descriptions, and SHA256 fingerprints."
        actions={<FileUploadPanel onUploaded={onUploaded} />}
      />
      <SearchFilters filters={filters} setFilters={setFilters} onSearch={runSearch} onContextSearch={runContextSearch} />

      {error && <div className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger ring-1 ring-danger/20">{error}</div>}
      {loading ? (
        <LoadingState />
      ) : files.length ? (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {files.map((file) => (
            <motion.div variants={revealItem} key={file._id}>
              <FileCard file={file} onSelect={setSelectedFile} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-6"><EmptyState title="No matching files" message="Try a different metadata key, context value, or status space." /></div>
      )}
    </motion.div>
  );
};

export default FileExplorer;
