import express from "express";
import {
  addMetadataToFile,
  deleteMetadata,
  getMetadataByFile,
  updateFileContext,
  updateMetadata
} from "../controllers/metadataController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/file/:fileId", validateObjectId("fileId"), getMetadataByFile);
router.post("/file/:fileId", allowRoles("admin", "editor"), validateObjectId("fileId"), addMetadataToFile);
router.put("/context/:fileId", allowRoles("admin", "editor"), validateObjectId("fileId"), updateFileContext);
router.put("/:id", allowRoles("admin", "editor"), validateObjectId("id"), updateMetadata);
router.delete("/:id", allowRoles("admin", "editor"), validateObjectId("id"), deleteMetadata);

export default router;
