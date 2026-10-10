import { getCurrentUser, verifyToken } from "../services/authService.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) { const error = new Error("Authentication is required"); error.statusCode = 401; throw error; }
    const payload = verifyToken(header.slice(7));
    req.user = await getCurrentUser(payload.sub);
    return next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    return next(error);
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) { const error = new Error("You do not have permission to perform this action"); error.statusCode = 403; return next(error); }
  return next();
};
