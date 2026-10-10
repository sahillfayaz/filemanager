import { statusConfig } from "../utils/status.js";

const StatusBadge = ({ status = "content" }) => {
  const config = statusConfig[status] || statusConfig.content;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold ring-1 ${config.ring} ${config.color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_16px_currentColor]" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
