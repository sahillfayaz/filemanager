import { apiClient, unwrap } from "./client.js";

export const getFileShares = async (fileId) => unwrap(await apiClient.get(`/shares/file/${fileId}`));
export const createFileShare = async (fileId, payload) => unwrap(await apiClient.post(`/shares/file/${fileId}`, { ...payload, performedBy: "Workspace Operator" }));
export const revokeFileShare = async (id) => unwrap(await apiClient.patch(`/shares/${id}/revoke`, { performedBy: "Workspace Operator" }));
