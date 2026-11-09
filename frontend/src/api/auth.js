import { apiClient, unwrap } from "./client.js";
export { clearSession, getStoredUser, getToken, saveSession } from "./session.js";
export const login = async (payload) => unwrap(await apiClient.post("/auth/login", payload));
export const bootstrap = async (payload) => unwrap(await apiClient.post("/auth/bootstrap", payload));
export const getCurrentUser = async () => unwrap(await apiClient.get("/auth/me"));
export const requestAdmin = async (payload) => unwrap(await apiClient.post("/auth/admin-requests", payload));
export const getAdminRequests = async () => unwrap(await apiClient.get("/auth/admin-requests"));
export const decideAdminRequest = async (id, approve) => unwrap(await apiClient.patch(`/auth/admin-requests/${id}`, { approve }));
