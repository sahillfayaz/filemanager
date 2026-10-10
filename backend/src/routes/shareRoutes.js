import express from "express";
import { addShare, getShares, revoke, sharedDownload } from "../controllers/shareController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";
import { limitTextFields, requireFields } from "../middleware/validateRequest.js";

const router = express.Router();
router.get("/access/:token/download", sharedDownload);
router.use(requireAuth);
router.get("/file/:fileId", validateObjectId("fileId"), getShares);
router.post("/file/:fileId", allowRoles("admin", "editor"), validateObjectId("fileId"), requireFields("recipient"), limitTextFields(["recipient"], 160), addShare);
router.patch("/:id/revoke", allowRoles("admin", "editor"), validateObjectId("id"), revoke);
export default router;
