import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { ensureStorageDirectories } from "./config/storage.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";
const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isPrivateNetworkOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return /^(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})$/.test(hostname);
  } catch {
    return false;
  }
};

ensureStorageDirectories();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || configuredOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && isPrivateNetworkOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin is not allowed"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SIFS backend is running",
    apiBase: "/api"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", apiLimiter, apiRoutes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, host, () => {
      console.log(`SIFS backend running on http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
