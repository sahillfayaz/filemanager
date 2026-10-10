import { apiClient, unwrap } from "./client.js";

export const getActivities = async ({ page = 1, limit = 25 } = {}) => {
  return unwrap(await apiClient.get("/activity", { params: { page, limit } }));
};

export const getActivitiesForFile = async (fileId, { page = 1, limit = 25 } = {}) => {
  return unwrap(await apiClient.get(`/activity/file/${fileId}`, { params: { page, limit } }));
};
