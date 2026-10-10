import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, X } from "lucide-react";
import { uploadFile } from "../api/files.js";

const initialForm = {
  file: null,
  employee: "",
  department: "",
  event: "",
  year: "",
  category: "",
  tags: "",
  description: "",
  uploadedBy: "Workspace Operator",
  metadataItems: [{ key: "", value: "" }]
};

const FileUploadPanel = ({ onUploaded }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const updateMetadata = (index, field, value) => {
    setForm((current) => ({
      ...current,
      metadataItems: current.metadataItems.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  };

  const addMetadataRow = () => {
    setForm((current) => ({ ...current, metadataItems: [...current.metadataItems, { key: "", value: "" }] }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setError("Select a file before uploading.");
      return;
    }

    setBusy(true);
    setError("");
    setProgress(0);

    try {
      const uploaded = await uploadFile(form, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setProgress(percent);
      });
      setForm(initialForm);
      setOpen(false);
      onUploaded?.(uploaded);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-bold text-void shadow-gold transition hover:brightness-110">
        <UploadCloud size={18} />
        Upload File
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xl"
          >
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 170, damping: 22 }}
              className="glass-panel max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[28px] p-6"
            >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono-label text-primary/70">Ingest Node</p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">Upload contextual file</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white/[0.06] p-2 text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-accent/35 bg-accent/[0.035] px-6 py-10 text-center transition hover:bg-accent/[0.07]">
              <UploadCloud size={34} className="text-accent" />
              <span className="mt-3 font-semibold text-white">{form.file?.name || "Drop a file into the knowledge archive"}</span>
              <span className="mt-1 text-sm text-white/42">Multer field: file · SHA256 generated on backend</span>
              <input type="file" className="hidden" onChange={(event) => update("file", event.target.files?.[0] || null)} />
            </label>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {["employee", "department", "event", "year", "category", "tags"].map((field) => (
                <input
                  key={field}
                  className="input-shell h-12 px-4"
                  placeholder={field === "tags" ? "Tags comma separated" : field[0].toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                />
              ))}
            </div>

            <textarea
              className="input-shell mt-3 min-h-24 p-4"
              placeholder="Description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Additional metadata</p>
                <button type="button" onClick={addMetadataRow} className="rounded-xl bg-white/[0.06] px-3 py-1.5 text-xs text-white/70 hover:text-white">
                  Add row
                </button>
              </div>
              <div className="space-y-2">
                {form.metadataItems.map((item, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-2">
                    <input className="input-shell h-11 px-3 text-sm" placeholder="Key" value={item.key} onChange={(event) => updateMetadata(index, "key", event.target.value)} />
                    <input className="input-shell h-11 px-3 text-sm" placeholder="Value" value={item.value} onChange={(event) => updateMetadata(index, "value", event.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger ring-1 ring-danger/20">{error}</p>}
            {busy && <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]"><motion.div className="h-full bg-accent" style={{ width: `${progress}%` }} /></div>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-2xl bg-white/[0.06] px-5 py-3 font-semibold text-white/68 hover:text-white">
                Cancel
              </button>
              <button disabled={busy} className="rounded-2xl bg-primary px-6 py-3 font-bold text-void shadow-gold disabled:opacity-50">
                {busy ? "Uploading..." : "Commit to Archive"}
              </button>
            </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FileUploadPanel;
