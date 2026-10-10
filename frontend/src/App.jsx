import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FileExplorer from "./pages/FileExplorer.jsx";
import FileDetails from "./pages/FileDetails.jsx";
import ActivityCenter from "./pages/ActivityCenter.jsx";
import Archive from "./pages/Archive.jsx";
import DeletionSpace from "./pages/DeletionSpace.jsx";
import KnowledgeGraph from "./pages/KnowledgeGraph.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explorer" element={<FileExplorer />} />
          <Route path="/files/:id" element={<FileDetails />} />
          <Route path="/activity" element={<ActivityCenter />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/deletion" element={<DeletionSpace />} />
          <Route path="/knowledge" element={<KnowledgeGraph />} />
        </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
