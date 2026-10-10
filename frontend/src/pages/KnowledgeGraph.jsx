import { useEffect, useState } from "react";
import { GitBranch, Network, Plus, Trash2 } from "lucide-react";
import { createConcept, createInstance, createRelationship, deleteRelationship, getConceptTree, getInstances, getInvertedFileTree, getRelationships } from "../api/knowledge.js";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import WorkspacePanel from "../components/WorkspacePanel.jsx";
import { pageTransition } from "../utils/motion.js";
import { motion } from "framer-motion";

const blankConcept = { name: "", type: "", parentConceptId: "", description: "" };
const blankInstance = { conceptId: "", name: "", attributes: "" };
const blankRelationship = { sourceType: "concept", sourceId: "", targetType: "instance", targetId: "", relationshipType: "contains", description: "" };

const KnowledgeGraph = () => {
  const [tree, setTree] = useState([]);
  const [instances, setInstances] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [invertedTree, setInvertedTree] = useState([]);
  const [invertedType, setInvertedType] = useState("department");
  const [concept, setConcept] = useState(blankConcept);
  const [instance, setInstance] = useState(blankInstance);
  const [relationship, setRelationship] = useState(blankRelationship);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [treeData, instanceData, relationshipData, invertedData] = await Promise.all([getConceptTree(), getInstances(), getRelationships(), getInvertedFileTree({ type: invertedType })]);
      setTree(treeData || []); setInstances(instanceData || []); setRelationships(relationshipData || []); setInvertedTree(invertedData || []);
    } catch (err) { setError(err.message || "Could not load the knowledge graph."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [invertedType]);

  const submit = async (event, action, values, reset) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await action({ ...values, performedBy: "Workspace Operator" }); reset(); await load(); }
    catch (err) { setError(err.message || "Could not save this item."); }
    finally { setSaving(false); }
  };
  const remove = async (id) => {
    if (!window.confirm("Remove this relationship?")) return;
    setSaving(true); try { await deleteRelationship(id); await load(); } catch (err) { setError(err.message || "Could not remove the relationship."); } finally { setSaving(false); }
  };
  const submitInstance = async (event) => {
    event.preventDefault();
    let attributes = {};
    try { attributes = instance.attributes.trim() ? JSON.parse(instance.attributes) : {}; }
    catch { setError("Attributes must be valid JSON, for example {\"year\": \"2026\"}."); return; }
    await submit(event, createInstance, { ...instance, attributes }, () => setInstance(blankInstance));
  };
  const conceptOptions = flattenTree(tree);

  return <motion.div {...pageTransition}>
    <PageHeader eyebrow="Phase 2 · Knowledge Model" title="Knowledge Graph" description="Create reusable concepts and instances, then connect them into explicit social-information relationships." />
    {error && <div role="alert" className="mb-6 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger ring-1 ring-danger/20">{error}</div>}
    {loading ? <LoadingState label="Loading knowledge graph..." /> : <div className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
      <WorkspacePanel className="p-6"><SectionTitle icon={GitBranch} title="Concept Tree" />
        {tree.length ? <div className="mt-5 space-y-2">{tree.map((node) => <TreeNode key={node._id} node={node} />)}</div> : <EmptyState title="No concepts yet" message="Create your first context concept below." />}
        <form onSubmit={(e) => submit(e, createConcept, concept, () => setConcept(blankConcept))} className="mt-6 grid gap-3">
          <input required className="input-shell h-10 px-3 text-sm" placeholder="Concept name (e.g. Department)" value={concept.name} onChange={(e) => setConcept({ ...concept, name: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2"><input className="input-shell h-10 px-3 text-sm" placeholder="Type (optional)" value={concept.type} onChange={(e) => setConcept({ ...concept, type: e.target.value })} /><select className="input-shell h-10 px-3 text-sm" value={concept.parentConceptId} onChange={(e) => setConcept({ ...concept, parentConceptId: e.target.value })}><option value="">Top-level concept</option>{conceptOptions.map((item) => <option key={item._id} value={item._id}>{item.label}</option>)}</select></div>
          <input className="input-shell h-10 px-3 text-sm" placeholder="Description (optional)" value={concept.description} onChange={(e) => setConcept({ ...concept, description: e.target.value })} />
          <SubmitButton saving={saving} label="Add concept" />
        </form>
      </WorkspacePanel>
      <WorkspacePanel className="p-6"><SectionTitle icon={Network} title="Instances" />
        {instances.length ? <div className="mt-5 space-y-2">{instances.map((item) => <div key={item._id} className="rounded-xl bg-white/[0.04] p-3"><p className="font-semibold text-white">{item.name}</p><p className="mt-1 text-xs text-white/45">{item.conceptId?.name || "Unknown concept"}</p><p className="mt-2 break-all font-mono text-[0.65rem] text-white/32">ID: {item._id}</p></div>)}</div> : <EmptyState title="No instances yet" message="Instances are real values within a concept." />}
        <form onSubmit={submitInstance} className="mt-6 grid gap-3">
          <select required className="input-shell h-10 px-3 text-sm" value={instance.conceptId} onChange={(e) => setInstance({ ...instance, conceptId: e.target.value })}><option value="">Select a concept</option>{conceptOptions.map((item) => <option key={item._id} value={item._id}>{item.label}</option>)}</select>
          <input required className="input-shell h-10 px-3 text-sm" placeholder="Instance name (e.g. ISE)" value={instance.name} onChange={(e) => setInstance({ ...instance, name: e.target.value })} />
          <input className="input-shell h-10 px-3 text-sm" placeholder='Attributes JSON, e.g. {"year":"2026"}' value={instance.attributes} onChange={(e) => setInstance({ ...instance, attributes: e.target.value })} />
          <SubmitButton saving={saving} label="Add instance" />
        </form>
      </WorkspacePanel>
      <WorkspacePanel className="p-6 2xl:col-span-2"><SectionTitle icon={Network} title="Relationship Mapping" />
        <form onSubmit={(e) => submit(e, createRelationship, relationship, () => setRelationship(blankRelationship))} className="mt-5 grid gap-3 md:grid-cols-3">
          {[["sourceType", "Source type"], ["sourceId", "Source ID"], ["targetType", "Target type"], ["targetId", "Target ID"], ["relationshipType", "Relationship (e.g. belongs_to)"], ["description", "Description (optional)"]].map(([field, placeholder]) => <input key={field} required={!field.includes("description")} className="input-shell h-10 px-3 text-sm" placeholder={placeholder} value={relationship[field]} onChange={(e) => setRelationship({ ...relationship, [field]: e.target.value })} />)}
          <SubmitButton saving={saving} label="Create relationship" />
        </form>
        <div className="mt-6 space-y-2">{relationships.length ? relationships.map((item) => <div key={item._id} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] p-3 text-sm"><p className="min-w-0 truncate text-white/78"><span className="text-accent">{item.sourceType}</span> <span className="text-white">— {item.relationshipType} →</span> <span className="text-primary">{item.targetType}</span></p><button disabled={saving} onClick={() => remove(item._id)} aria-label="Remove relationship" className="text-white/40 hover:text-danger"><Trash2 size={16} /></button></div>) : <EmptyState title="No relationships yet" message="Use IDs from created concepts or instances to connect graph nodes." />}</div>
      </WorkspacePanel>
      <WorkspacePanel className="p-6 2xl:col-span-2"><SectionTitle icon={GitBranch} title="Inverted File Tree" />
        <p className="mt-2 text-sm text-white/48">Browse from a context value to every active file linked to it.</p>
        <select className="input-shell mt-4 h-10 max-w-xs px-3 text-sm" value={invertedType} onChange={(event) => setInvertedType(event.target.value)}>
          {["employee", "department", "event", "year", "category", "tags", "metadata"].map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}
        </select>
        {invertedTree.length ? <div className="mt-5 grid gap-3 md:grid-cols-2">{invertedTree.map((branch) => <div key={branch.value} className="rounded-2xl bg-white/[0.04] p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-accent">{branch.value}</p><span className="rounded-full bg-accent/10 px-2 py-1 text-xs text-accent">{branch.count}</span></div><div className="mt-3 space-y-2">{branch.files.map((file) => <Link key={file._id} to={`/files/${file._id}`} className="block truncate rounded-lg bg-black/20 px-3 py-2 text-sm text-white/72 hover:bg-primary/10 hover:text-white">{file.originalName}</Link>)}</div></div>)}</div> : <div className="mt-5"><EmptyState title="No indexed branches" message="Upload files with context fields or metadata to build this view." /></div>}
      </WorkspacePanel>
    </div>}
  </motion.div>;
};

const flattenTree = (nodes, depth = 0) => nodes.flatMap((node) => [{ _id: node._id, label: `${"— ".repeat(depth)}${node.name}` }, ...flattenTree(node.children || [], depth + 1)]);
const TreeNode = ({ node, depth = 0 }) => <div className="rounded-xl bg-white/[0.04] p-3" style={{ marginLeft: `${depth * 14}px` }}><p className="font-semibold text-white">{node.name}</p>{node.type && <p className="text-xs text-accent/70">{node.type}</p>}<p className="mt-2 break-all font-mono text-[0.65rem] text-white/32">ID: {node._id}</p>{node.children?.map((child) => <div className="mt-2" key={child._id}><TreeNode node={child} depth={depth + 1} /></div>)}</div>;
const SectionTitle = ({ icon: Icon, title }) => <div className="flex items-center gap-3"><Icon className="text-accent" size={20} /><h2 className="text-xl font-bold text-white">{title}</h2></div>;
const SubmitButton = ({ saving, label }) => <button disabled={saving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-void disabled:opacity-60"><Plus size={16} />{label}</button>;
export default KnowledgeGraph;
