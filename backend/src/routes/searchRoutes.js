import express from "express";
import { searchByContext, searchByHash, searchFiles } from "../controllers/searchController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", searchFiles);
router.get("/context", searchByContext);
router.get("/hash/:sha256Hash", searchByHash);

export default router;
