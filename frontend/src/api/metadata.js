import { apiClient, unwrap } from "./client.js";

export const getMetadataByFile = async (fileId) => {
  return unwrap(await apiClient.get(`/metadata/file/${fileId}`));
};

export const addMetadataToFile = async (fileId, items, performedBy = "Workspace Operator") => {
  return unwrap(await apiClient.post(`/metadata/file/${fileId}`, { items, performedBy }));
};

export const updateMetadata = async (id, payload) => {
  return unwrap(await apiClient.put(`/metadata/${id}`, payload));
};

export const deleteMetadata = async (id, performedBy = "Workspace Operator") => {
  return unwrap(await apiClient.delete(`/metadata/${id}`, { data: { performedBy } }));
};

export const updateFileContext = async (fileId, payload) => {
  return unwrap(await apiClient.put(`/metadata/context/${fileId}`, payload));
};
