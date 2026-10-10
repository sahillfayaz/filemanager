import express from "express";
import { addConcept, addInstance, addRelationship, deleteRelationship, getProvenance, listConceptTree, listInstances, listInvertedFileTree, listRelationships } from "../controllers/knowledgeController.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(requireAuth);
router.get("/concepts/tree", listConceptTree);
router.get("/inverted-tree", listInvertedFileTree);
router.get("/provenance/:fileId", validateObjectId("fileId"), getProvenance);
router.post("/concepts", allowRoles("admin", "editor"), addConcept);
router.get("/instances", listInstances);
router.post("/instances", allowRoles("admin", "editor"), addInstance);
router.get("/relationships", listRelationships);
router.post("/relationships", allowRoles("admin", "editor"), addRelationship);
router.delete("/relationships/:id", allowRoles("admin", "editor"), validateObjectId("id"), deleteRelationship);
export default router;
