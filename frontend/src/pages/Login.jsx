import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { bootstrap, getStoredUser, login, saveSession } from "../api/auth.js";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  if (getStoredUser()) return <Navigate to="/dashboard" replace />;
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { const data = await (mode === "bootstrap" ? bootstrap(form) : login(form)); saveSession(data); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(err.message || "Could not sign in."); }
    finally { setSaving(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-void p-5 text-white"><section className="glass-panel w-full max-w-md rounded-[28px] p-7"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-void"><ShieldCheck size={24} /></div><p className="mono-label mt-6 text-accent/80">SIFS secure access</p><h1 className="mt-2 text-3xl font-extrabold">{mode === "bootstrap" ? "Create first admin" : "Welcome back"}</h1><p className="mt-3 text-sm leading-6 text-white/52">{mode === "bootstrap" ? "Use this only once to create the first administrator account." : "Sign in to access the knowledge archive."}</p>{error && <div role="alert" className="mt-5 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}<form onSubmit={submit} className="mt-6 space-y-4">{mode === "bootstrap" && <input required className="input-shell h-11 px-3" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}<input required type="email" className="input-shell h-11 px-3" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required minLength="8" type="password" className="input-shell h-11 px-3" placeholder="Password (minimum 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent font-bold text-void disabled:opacity-60"><KeyRound size={16} />{saving ? "Please wait..." : mode === "bootstrap" ? "Create administrator" : "Sign in"}</button></form><button onClick={() => { setMode(mode === "login" ? "bootstrap" : "login"); setError(""); }} className="mt-5 text-sm font-semibold text-primary hover:text-white">{mode === "login" ? "First setup? Create the administrator account" : "An account exists? Sign in instead"}</button></section></main>;
};
export default Login;
