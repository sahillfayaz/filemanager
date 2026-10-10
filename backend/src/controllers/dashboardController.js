import { getDashboardStats } from "../services/dashboardService.js";
import { successResponse } from "../utils/response.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    return successResponse(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    return next(error);
  }
};
