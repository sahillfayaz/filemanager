const TOKEN_KEY = "sifs_auth_token";
const USER_KEY = "sifs_auth_user";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
export const saveSession = ({ token, user }) => { sessionStorage.setItem(TOKEN_KEY, token); sessionStorage.setItem(USER_KEY, JSON.stringify(user)); };
export const clearSession = () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); };
