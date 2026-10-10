import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { clearSession, getCurrentUser } from "../api/auth.js";
import LoadingState from "./LoadingState.jsx";

const ProtectedRoute = () => {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => { getCurrentUser().then(() => setAllowed(true)).catch(() => { clearSession(); setAllowed(false); }).finally(() => setReady(true)); }, []);
  if (!ready) return <LoadingState label="Checking secure session..." />;
  return allowed ? <Outlet /> : <Navigate to="/login" replace />;
};
export default ProtectedRoute;
