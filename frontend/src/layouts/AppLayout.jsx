import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import BackgroundAtmosphere from "../components/BackgroundAtmosphere.jsx";
import NavRail from "../components/NavRail.jsx";
import InspectorPanel from "../components/InspectorPanel.jsx";
import { getDashboardStats } from "../api/dashboard.js";

const AppLayout = () => {
  const [stats, setStats] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="min-h-screen bg-void text-white">
      <BackgroundAtmosphere />
      <NavRail />
      <main className="min-h-screen px-4 pb-24 pt-5 sm:px-6 lg:pb-5 lg:pl-[116px] xl:pr-[364px]">
        <div className="mx-auto max-w-[1440px]">
          <Outlet context={{ selectedFile, setSelectedFile, stats, setStats }} />
        </div>
      </main>
      <InspectorPanel selectedFile={selectedFile} stats={stats} />
    </div>
  );
};

export default AppLayout;
