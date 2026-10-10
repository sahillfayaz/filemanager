import { apiClient, unwrap } from "./client.js";

export const getConceptTree = async () => unwrap(await apiClient.get("/knowledge/concepts/tree"));
export const createConcept = async (payload) => unwrap(await apiClient.post("/knowledge/concepts", payload));
export const getInstances = async () => unwrap(await apiClient.get("/knowledge/instances"));
export const createInstance = async (payload) => unwrap(await apiClient.post("/knowledge/instances", payload));
export const getRelationships = async () => unwrap(await apiClient.get("/knowledge/relationships"));
export const getInvertedFileTree = async (params) => unwrap(await apiClient.get("/knowledge/inverted-tree", { params }));
export const getFileProvenance = async (fileId) => unwrap(await apiClient.get(`/knowledge/provenance/${fileId}`));
export const createRelationship = async (payload) => unwrap(await apiClient.post("/knowledge/relationships", payload));
export const deleteRelationship = async (id) => unwrap(await apiClient.delete(`/knowledge/relationships/${id}`, { data: { performedBy: "Workspace Operator" } }));
