import express from "express";
import { getActivities, getActivitiesForFile } from "../controllers/activityController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getActivities);
router.get("/file/:fileId", validateObjectId("fileId"), getActivitiesForFile);

export default router;
