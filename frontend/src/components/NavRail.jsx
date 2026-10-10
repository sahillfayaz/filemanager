import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Archive, DatabaseZap, Files, LayoutDashboard, Network, Trash2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Explorer", path: "/explorer", icon: Files },
  { label: "Activity", path: "/activity", icon: Activity },
  { label: "Knowledge", path: "/knowledge", icon: Network },
  { label: "Archive", path: "/archive", icon: Archive },
  { label: "Deletion", path: "/deletion", icon: Trash2 }
];

const NavRail = () => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[92px] border-r border-white/[0.07] bg-void/72 px-4 py-5 backdrop-blur-2xl lg:block">
        <div className="flex h-full flex-col items-center justify-between">
          <div className="flex flex-col items-center gap-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-void shadow-gold"
            >
              <DatabaseZap size={25} />
            </motion.div>
            <NavItems vertical />
          </div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-between rounded-[24px] border border-white/[0.08] bg-void/82 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        <NavItems />
      </nav>
    </>
  );
};

const NavItems = ({ vertical = false }) => (
  <div className={vertical ? "flex flex-col gap-3" : "flex w-full justify-between gap-1"}>
    {navItems.map((item, index) => (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: vertical ? -10 : 0, y: vertical ? 0 : 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.08 * index }}
        className={vertical ? "" : "flex-1"}
      >
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `group relative grid h-12 place-items-center rounded-2xl transition ${vertical ? "w-12" : "w-full"} ${
              isActive
                ? "bg-white/[0.10] text-accent ring-1 ring-accent/30"
                : "text-white/42 hover:bg-white/[0.06] hover:text-white"
            }`
          }
          title={item.label}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId={vertical ? "nav-rail-active" : "mobile-nav-active"}
                  className="absolute inset-0 rounded-2xl bg-accent/8 shadow-glow"
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                />
              )}
              <item.icon className="relative z-10" size={20} />
            </>
          )}
        </NavLink>
      </motion.div>
    ))}
  </div>
);

export default NavRail;
