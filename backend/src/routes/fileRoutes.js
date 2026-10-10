import express from "express";
import {
  archiveFile,
  downloadFile,
  getFileDetails,
  getFiles,
  moveFileToDeletion,
  permanentDelete,
  restoreFile,
  uploadFile
} from "../controllers/fileController.js";
import { uploadSingleFile } from "../middleware/uploadMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.post("/upload", allowRoles("admin", "editor"), uploadSingleFile, uploadFile);
router.get("/", getFiles);
router.get("/:id", validateObjectId("id"), getFileDetails);
router.get("/:id/download", validateObjectId("id"), downloadFile);
router.patch("/:id/archive", allowRoles("admin", "editor"), validateObjectId("id"), archiveFile);
router.patch("/:id/restore", allowRoles("admin", "editor"), validateObjectId("id"), restoreFile);
router.patch("/:id/deletion", allowRoles("admin", "editor"), validateObjectId("id"), moveFileToDeletion);
router.delete("/:id/permanent", allowRoles("admin"), validateObjectId("id"), permanentDelete);

export default router;
