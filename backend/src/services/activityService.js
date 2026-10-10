import ActivityLog from "../models/ActivityLog.js";

export const createActivityLog = async ({
  action,
  entityType,
  entityId = null,
  message,
  performedBy = process.env.DEFAULT_USER || "System User",
  metadata = {}
}) => {
  return ActivityLog.create({
    action,
    entityType,
    entityId,
    message,
    performedBy,
    metadata
  });
};

export const getActivityLogs = async ({ page = 1, limit = 25 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ActivityLog.countDocuments()
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1
    }
  };
};

export const getActivityLogsForFile = async (fileId, { page = 1, limit = 25 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    ActivityLog.find({ entityId: fileId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ActivityLog.countDocuments({ entityId: fileId })
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1
    }
  };
};
