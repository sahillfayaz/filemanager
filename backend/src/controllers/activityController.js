import { getActivityLogs, getActivityLogsForFile } from "../services/activityService.js";
import { successResponse } from "../utils/response.js";

export const getActivities = async (req, res, next) => {
  try {
    const data = await getActivityLogs(req.query);
    return successResponse(res, data, "Activity logs fetched successfully");
  } catch (error) {
    return next(error);
  }
};

export const getActivitiesForFile = async (req, res, next) => {
  try {
    const data = await getActivityLogsForFile(req.params.fileId, req.query);
    return successResponse(res, data, "File activity logs fetched successfully");
  } catch (error) {
    return next(error);
  }
};
