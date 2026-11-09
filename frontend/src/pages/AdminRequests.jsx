import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { decideAdminRequest, getAdminRequests } from "../api/auth.js";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import WorkspacePanel from "../components/WorkspacePanel.jsx";

const AdminRequests = () => {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { setLoading(true); try { setItems(await getAdminRequests()); } catch (err) { setError(err.message || "Only the primary administrator can access this page."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const decide = async (id, approve) => { try { await decideAdminRequest(id, approve); await load(); } catch (err) { setError(err.message); } };
  return <><PageHeader eyebrow="Primary administration" title="Admin approvals" description="Approve or reject requests for administrator access." />{error && <div className="mb-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</div>}{loading ? <LoadingState /> : <WorkspacePanel className="p-6">{items.length ? <div className="space-y-3">{items.map((user) => <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-4"><div><p className="font-semibold text-white">{user.name}</p><p className="mt-1 text-sm text-white/48">{user.email}</p></div><div className="flex gap-2"><button onClick={() => decide(user.id, true)} className="inline-flex items-center gap-2 rounded-xl bg-success px-3 py-2 text-sm font-bold text-void"><Check size={16} />Approve</button><button onClick={() => decide(user.id, false)} className="inline-flex items-center gap-2 rounded-xl bg-danger/15 px-3 py-2 text-sm font-bold text-danger"><X size={16} />Reject</button></div></div>)}</div> : <EmptyState title="No pending administrator requests" message="New administrator accounts will appear here for approval." />}</WorkspacePanel>}</>;
};
export default AdminRequests;
