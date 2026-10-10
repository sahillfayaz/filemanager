import File from "../models/File.js";
import ActivityLog from "../models/ActivityLog.js";
import { FILE_STATUS } from "../utils/constants.js";

export const getDashboardStats = async () => {
  const [
    totalFiles,
    contentFiles,
    archivedFiles,
    deletionFiles,
    storageAggregation,
    recentActivities
  ] = await Promise.all([
    File.countDocuments(),
    File.countDocuments({ status: FILE_STATUS.CONTENT }),
    File.countDocuments({ status: FILE_STATUS.ARCHIVE }),
    File.countDocuments({ status: FILE_STATUS.DELETION }),
    File.aggregate([{ $group: { _id: null, totalStorageUsed: { $sum: "$size" } } }]),
    ActivityLog.find().sort({ createdAt: -1 }).limit(8)
  ]);

  return {
    totalFiles,
    contentFiles,
    archivedFiles,
    deletionFiles,
    totalStorageUsed: storageAggregation[0]?.totalStorageUsed || 0,
    recentActivities
  };
};
