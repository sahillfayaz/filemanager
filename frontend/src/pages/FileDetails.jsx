import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Archive, Copy, Download, Link2, Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { archiveFile, downloadFile, getFileDetails, moveToDeletion, restoreFile } from "../api/files.js";
import { getActivitiesForFile } from "../api/activity.js";
import { addMetadataToFile, deleteMetadata, updateFileContext, updateMetadata } from "../api/metadata.js";
import { getFileProvenance } from "../api/knowledge.js";
import { createFileShare, getFileShares, revokeFileShare } from "../api/shares.js";
import ActivityTimeline from "../components/ActivityTimeline.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import WorkspacePanel from "../components/WorkspacePanel.jsx";
import { formatBytes, formatDate } from "../utils/format.js";
import { pageTransition } from "../utils/motion.js";

const FileDetails = () => {
  const { id } = useParams();
  const { setSelectedFile } = useOutletContext();
  const [file, setFile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [provenance, setProvenance] = useState(null);
  const [shares, setShares] = useState([]);
  const [shareDraft, setShareDraft] = useState({ recipient: "", expiresInDays: 7 });
  const [latestShareUrl, setLatestShareUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingContext, setEditingContext] = useState(false);
  const [contextDraft, setContextDraft] = useState({});
  const [metadataDraft, setMetadataDraft] = useState({ key: "", value: "" });
  const [editingMetadataId, setEditingMetadataId] = useState(null);
  const [metadataEditDraft, setMetadataEditDraft] = useState({ key: "", value: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [fileData, activityData, provenanceData, shareData] = await Promise.all([
      getFileDetails(id),
      getActivitiesForFile(id, { limit: 30 }),
      getFileProvenance(id).catch(() => null),
      getFileShares(id).catch(() => [])
    ]);
    setFile(fileData);
    setContextDraft({
      employee: fileData.context?.employee || "",
      department: fileData.context?.department || "",
      event: fileData.context?.event || "",
      year: fileData.context?.year || "",
      category: fileData.context?.category || "",
      tags: (fileData.context?.tags || []).join(", ")
    });
    setSelectedFile(fileData);
    setActivities(activityData.items || []);
    setProvenance(provenanceData);
    setShares(shareData || []);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [id]);

  const action = async (handler) => {
    try {
      setError("");
      const updated = await handler(file._id);
      setFile(updated);
      setSelectedFile(updated);
      await load();
    } catch (err) {
      setError(err.message || "Could not update the file.");
    }
  };

  const saveContext = async () => {
    try {
      setSaving(true);
      setError("");
      await updateFileContext(file._id, contextDraft);
      setEditingContext(false);
      await load();
    } catch (err) {
      setError(err.message || "Could not save the context.");
    } finally {
      setSaving(false);
    }
  };

  const addMetadata = async (event) => {
    event.preventDefault();
    if (!metadataDraft.key.trim() || !metadataDraft.value.trim()) return;
    try {
      setSaving(true);
      setError("");
      await addMetadataToFile(file._id, [metadataDraft]);
      setMetadataDraft({ key: "", value: "" });
      await load();
    } catch (err) {
      setError(err.message || "Could not add metadata.");
    } finally {
      setSaving(false);
    }
  };

  const removeMetadata = async (metadataId) => {
    if (!window.confirm("Remove this metadata entry?")) return;
    try {
      setSaving(true);
      setError("");
      await deleteMetadata(metadataId);
      await load();
    } catch (err) {
      setError(err.message || "Could not remove metadata.");
    } finally {
      setSaving(false);
    }
  };

  const saveMetadata = async (event) => {
    event.preventDefault();
    if (!metadataEditDraft.key.trim() || !metadataEditDraft.value.trim()) return;
    try {
      setSaving(true);
      setError("");
      await updateMetadata(editingMetadataId, metadataEditDraft);
      setEditingMetadataId(null);
      await load();
    } catch (err) {
      setError(err.message || "Could not update metadata.");
    } finally {
      setSaving(false);
    }
  };

  const createShare = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setError("");
      const data = await createFileShare(file._id, shareDraft);
      setLatestShareUrl(data.downloadUrl);
      setShareDraft({ recipient: "", expiresInDays: 7 });
      await load();
    } catch (err) { setError(err.message || "Could not create share link."); }
    finally { setSaving(false); }
  };

  const revokeShare = async (shareId) => {
    if (!window.confirm("Revoke this share link? The recipient will no longer be able to download the file.")) return;
    try { setSaving(true); setError(""); await revokeFileShare(shareId); await load(); }
    catch (err) { setError(err.message || "Could not revoke the share link."); }
    finally { setSaving(false); }
  };

  const copyShareUrl = async () => {
    try { await navigator.clipboard.writeText(latestShareUrl); }
    catch { window.prompt("Copy this share link:", latestShareUrl); }
  };

  if (loading) return <LoadingState />;
  if (!file) return <div className="text-white">File not found.</div>;

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        eyebrow="File Identity"
        title={file.originalName}
        description="A single physical file with multiple contextual access paths, metadata records, hash identity, and provenance events."
        actions={
          <>
            <button onClick={() => downloadFile(file._id, file.originalName).catch((err) => setError(err.message || "Could not download the file."))} className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 font-bold text-void shadow-glow"><Download size={17} />Download</button>
            {file.status !== "archive" && <button onClick={() => action(archiveFile)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-bold text-void shadow-gold"><Archive size={17} />Archive</button>}
            {file.status !== "content" && <button onClick={() => action(restoreFile)} className="inline-flex items-center gap-2 rounded-2xl bg-success px-4 py-3 font-bold text-void"><RotateCcw size={17} />Restore</button>}
            {file.status !== "deletion" && <button onClick={() => action(moveToDeletion)} className="inline-flex items-center gap-2 rounded-2xl bg-danger px-4 py-3 font-bold text-white shadow-danger"><Trash2 size={17} />Deletion</button>}
          </>
        }
      />

      {error && <div role="alert" className="mb-6 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger ring-1 ring-danger/20">{error}</div>}

      <div className="grid gap-6 2xl:grid-cols-[0.85fr_1.15fr]">
        <WorkspacePanel className="p-6">
          <div className="flex items-center justify-between">
            <p className="mono-label text-accent/70">Record Snapshot</p>
            <StatusBadge status={file.status} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Mime Type" value={file.mimeType} />
            <Info label="Size" value={formatBytes(file.size)} />
            <Info label="Uploaded By" value={file.uploadedBy} />
            <Info label="Created" value={formatDate(file.createdAt)} />
            <Info label="Stored Name" value={file.storedName} />
            <Info label="Storage Path" value={file.storagePath} />
          </div>
          <div className="mt-5 rounded-[20px] bg-black/30 p-4">
            <p className="mono-label text-primary/70">SHA256 Hash</p>
            <p className="mt-3 break-all font-mono text-sm leading-6 text-white/72">{file.sha256Hash}</p>
          </div>
          {file.description && <p className="mt-5 rounded-[20px] bg-white/[0.035] p-4 text-sm leading-6 text-white/58">{file.description}</p>}
        </WorkspacePanel>

        <WorkspacePanel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="mono-label text-primary/70">Context and Metadata</p>
            <button
              onClick={() => {
                if (!editingContext) {
                  setContextDraft({
                    employee: file.context?.employee || "", department: file.context?.department || "", event: file.context?.event || "",
                    year: file.context?.year || "", category: file.context?.category || "", tags: (file.context?.tags || []).join(", ")
                  });
                }
                setEditingContext((value) => !value);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/78 ring-1 ring-white/10 hover:bg-primary/15"
            >
              {editingContext ? <><X size={14} />Cancel</> : <><Pencil size={14} />Edit context</>}
            </button>
          </div>
          {editingContext ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {["employee", "department", "event", "year", "category", "tags"].map((field) => (
                <label key={field} className="text-xs text-white/50">
                  <span className="mb-1 block capitalize">{field}</span>
                  <input className="input-shell h-10 px-3" value={contextDraft[field] || ""} onChange={(event) => setContextDraft((draft) => ({ ...draft, [field]: event.target.value }))} />
                </label>
              ))}
              <button disabled={saving} onClick={saveContext} className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-xl bg-primary px-3 text-sm font-bold text-void disabled:opacity-60"><Save size={15} />Save context</button>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {["employee", "department", "event", "year", "category"].map((field) => (
                <Info key={field} label={field} value={file.context?.[field] || "Unmapped"} />
              ))}
              <Info label="Tags" value={(file.context?.tags || []).join(", ") || "No tags"} />
            </div>
          )}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(file.metadata || []).map((item) => (
              <div key={item._id} className="rounded-[18px] bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
                {editingMetadataId === item._id ? (
                  <form onSubmit={saveMetadata} className="space-y-2">
                    <input className="input-shell h-9 px-3 text-sm" value={metadataEditDraft.key} onChange={(event) => setMetadataEditDraft((draft) => ({ ...draft, key: event.target.value }))} />
                    <input className="input-shell h-9 px-3 text-sm" value={metadataEditDraft.value} onChange={(event) => setMetadataEditDraft((draft) => ({ ...draft, value: event.target.value }))} />
                    <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-void">Save</button><button type="button" onClick={() => setEditingMetadataId(null)} className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/70">Cancel</button></div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs text-white/38">{item.key}</p><p className="mt-1 font-semibold text-white">{item.value}</p></div>
                    <div className="flex gap-2"><button disabled={saving} onClick={() => { setEditingMetadataId(item._id); setMetadataEditDraft({ key: item.key, value: item.value }); }} aria-label={`Edit ${item.key}`} className="text-white/35 hover:text-accent disabled:opacity-50"><Pencil size={15} /></button><button disabled={saving} onClick={() => removeMetadata(item._id)} aria-label={`Remove ${item.key}`} className="text-white/35 hover:text-danger disabled:opacity-50"><Trash2 size={16} /></button></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={addMetadata} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input className="input-shell h-10 px-3 text-sm" placeholder="Metadata key" value={metadataDraft.key} onChange={(event) => setMetadataDraft((draft) => ({ ...draft, key: event.target.value }))} />
            <input className="input-shell h-10 px-3 text-sm" placeholder="Metadata value" value={metadataDraft.value} onChange={(event) => setMetadataDraft((draft) => ({ ...draft, value: event.target.value }))} />
            <button disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-3 text-sm font-bold text-void disabled:opacity-60"><Plus size={16} />Add</button>
          </form>
        </WorkspacePanel>
      </div>

      <WorkspacePanel className="mt-6 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="mono-label text-accent/70">Provenance Timeline</p>
            <h2 className="mt-1 text-xl font-bold text-white">File activity trace</h2>
          </div>
          <Link to="/activity" className="text-sm font-semibold text-accent hover:text-white">View all</Link>
        </div>
        <ActivityTimeline activities={activities} />
      </WorkspacePanel>

      {provenance && <ProvenanceMap provenance={provenance} />}

      <WorkspacePanel className="mt-6 p-6">
        <div className="flex items-center gap-3"><Link2 className="text-accent" size={20} /><div><p className="mono-label text-primary/70">File Sharing</p><h2 className="mt-1 text-xl font-bold text-white">Revocable download links</h2></div></div>
        <p className="mt-3 text-sm text-white/48">Create a time-limited link for a named recipient. Links only permit downloads and can be revoked at any time.</p>
        <form onSubmit={createShare} className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <input required className="input-shell h-10 px-3 text-sm" placeholder="Recipient name or email" value={shareDraft.recipient} onChange={(event) => setShareDraft((draft) => ({ ...draft, recipient: event.target.value }))} />
          <input required min="1" max="90" type="number" className="input-shell h-10 px-3 text-sm" value={shareDraft.expiresInDays} onChange={(event) => setShareDraft((draft) => ({ ...draft, expiresInDays: event.target.value }))} />
          <button disabled={saving || file.status === "deletion"} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-void disabled:opacity-60"><Link2 size={16} />Create link</button>
        </form>
        {latestShareUrl && <div className="mt-4 flex flex-col gap-2 rounded-xl bg-success/10 p-3 ring-1 ring-success/20 sm:flex-row sm:items-center"><p className="min-w-0 flex-1 break-all font-mono text-xs text-success">{latestShareUrl}</p><button onClick={copyShareUrl} className="inline-flex items-center justify-center gap-2 rounded-lg bg-success px-3 py-2 text-xs font-bold text-void"><Copy size={14} />Copy</button></div>}
        <div className="mt-5 space-y-2">{shares.length ? shares.map((share) => <div key={share._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-3"><div><p className="font-semibold text-white">{share.recipient}</p><p className="mt-1 text-xs text-white/45">Expires {formatDate(share.expiresAt)}{share.revokedAt ? " · Revoked" : " · Active"}</p></div>{!share.revokedAt && <button disabled={saving} onClick={() => revokeShare(share._id)} className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-bold text-danger hover:bg-danger/20 disabled:opacity-50">Revoke</button>}</div>) : <p className="text-sm text-white/42">No links have been shared for this file.</p>}</div>
      </WorkspacePanel>
    </motion.div>
  );
};

const Info = ({ label, value }) => (
  <div className="min-w-0 rounded-[18px] bg-white/[0.035] p-4 ring-1 ring-white/[0.06]">
    <p className="mono-label text-white/34">{label}</p>
    <p className="mt-2 truncate text-sm font-semibold text-white/82">{value}</p>
  </div>
);

const ProvenanceMap = ({ provenance }) => {
  const contextEntries = Object.entries(provenance.context || {}).filter(([, value]) => Array.isArray(value) ? value.length : value);
  return <WorkspacePanel className="mt-6 p-6">
    <p className="mono-label text-primary/70">Provenance Graph</p>
    <h2 className="mt-1 text-xl font-bold text-white">Evidence and relationship trace</h2>
    <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr] lg:items-center">
      <TraceNode label="File origin" value={provenance.file.originalName} detail={`SHA256 ${provenance.file.sha256Hash.slice(0, 12)}…`} />
      <TraceLine />
      <TraceNode label="Context routes" value={`${contextEntries.length} linked contexts`} detail={contextEntries.map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join(" · ") || "No context recorded"} />
      <TraceLine />
      <TraceNode label="Evidence trail" value={`${provenance.metadata.length} metadata · ${provenance.activities.length} events`} detail={`${provenance.relationships.length} direct relationships`} />
    </div>
  </WorkspacePanel>;
};

const TraceNode = ({ label, value, detail }) => <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07]"><p className="mono-label text-accent/70">{label}</p><p className="mt-2 font-semibold text-white">{value}</p><p className="mt-2 text-xs leading-5 text-white/45">{detail}</p></div>;
const TraceLine = () => <div className="hidden h-px min-w-8 bg-gradient-to-r from-accent/70 to-primary/60 lg:block" />;

export default FileDetails;
