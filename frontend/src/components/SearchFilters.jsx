import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

const SearchFilters = ({ filters, setFilters, onSearch, onContextSearch }) => {
  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  return (
    <motion.div layout className="glass-panel rounded-[24px] p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
          <input
            className="input-shell h-12 pl-11 pr-4"
            placeholder="Search name, metadata, context, or SHA256..."
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onSearch()}
          />
        </div>
        <select className="input-shell h-12 px-4 md:w-40" value={filters.status} onChange={(event) => update("status", event.target.value)}>
          <option value="content">Content</option>
          <option value="archive">Archive</option>
          <option value="deletion">Deletion</option>
        </select>
        <button onClick={onSearch} className="h-12 rounded-2xl bg-accent px-5 font-bold text-void shadow-glow transition hover:brightness-110">
          Search
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {["employee", "department", "event", "year", "category"].map((field) => (
          <input
            key={field}
            className="input-shell h-11 px-3 text-sm"
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={filters[field]}
            onChange={(event) => update(field, event.target.value)}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={onContextSearch} className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/76 ring-1 ring-white/10 transition hover:bg-primary/10 hover:text-primary">
          <SlidersHorizontal size={16} />
          Context Query
        </button>
      </div>
    </motion.div>
  );
};

export default SearchFilters;
