import { apiClient, unwrap } from "./client.js";

export const searchFiles = async ({ query, status = "content" }) => {
  if (!query?.trim()) return [];
  return unwrap(await apiClient.get("/search", { params: { query, status } }));
};

export const searchByContext = async (params) => {
  return unwrap(await apiClient.get("/search/context", { params }));
};

export const searchByHash = async (sha256Hash) => {
  return unwrap(await apiClient.get(`/search/hash/${sha256Hash}`));
};
