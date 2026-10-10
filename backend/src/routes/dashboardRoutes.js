import express from "express";
import { getStats } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", requireAuth, getStats);

export default router;
