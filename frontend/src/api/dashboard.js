import { apiClient, unwrap } from "./client.js";

export const getDashboardStats = async () => {
  return unwrap(await apiClient.get("/dashboard/stats"));
};
