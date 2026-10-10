import { apiClient, unwrap } from "./client.js";
export { clearSession, getStoredUser, getToken, saveSession } from "./session.js";
export const login = async (payload) => unwrap(await apiClient.post("/auth/login", payload));
export const bootstrap = async (payload) => unwrap(await apiClient.post("/auth/bootstrap", payload));
export const getCurrentUser = async () => unwrap(await apiClient.get("/auth/me"));
