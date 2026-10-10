import rateLimit from "express-rate-limit";

const jsonLimitMessage = (message) => ({ statusCode: 429, message });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 500),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next) => next(Object.assign(new Error("Too many requests. Please try again later."), jsonLimitMessage("Too many requests. Please try again later.")))
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT || 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res, next) => next(Object.assign(new Error("Too many sign-in attempts. Please wait 15 minutes."), jsonLimitMessage("Too many sign-in attempts. Please wait 15 minutes.")))
});
