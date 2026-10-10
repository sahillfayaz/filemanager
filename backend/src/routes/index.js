import express from "express";
import fileRoutes from "./fileRoutes.js";
import searchRoutes from "./searchRoutes.js";
import metadataRoutes from "./metadataRoutes.js";
import activityRoutes from "./activityRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import knowledgeRoutes from "./knowledgeRoutes.js";
import shareRoutes from "./shareRoutes.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

router.use("/files", fileRoutes);
router.use("/search", searchRoutes);
router.use("/metadata", metadataRoutes);
router.use("/activity", activityRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/knowledge", knowledgeRoutes);
router.use("/shares", shareRoutes);
router.use("/auth", authRoutes);

export default router;
