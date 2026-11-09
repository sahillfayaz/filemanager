import express from "express";
import { addUser, adminRequests, bootstrap, decideRequest, me, signIn, submitAdminRequest, users } from "../controllers/authController.js";
import { allowRoles, requireAuth, requirePrimaryAdmin } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";
import { limitTextFields, requireFields } from "../middleware/validateRequest.js";

const router = express.Router();
router.post("/bootstrap", authLimiter, requireFields("name", "email", "password"), limitTextFields(["name", "email", "password"], 128), bootstrap);
router.post("/login", authLimiter, requireFields("email", "password"), limitTextFields(["email", "password"], 128), signIn);
router.post("/admin-requests", authLimiter, requireFields("name", "email", "password"), limitTextFields(["name", "email", "password"], 128), submitAdminRequest);
router.get("/me", requireAuth, me);
router.get("/users", requireAuth, allowRoles("admin"), users);
router.post("/users", requireAuth, allowRoles("admin"), requireFields("name", "email", "password"), limitTextFields(["name", "email", "password"], 128), addUser);
router.get("/admin-requests", requireAuth, requirePrimaryAdmin, adminRequests);
router.patch("/admin-requests/:id", requireAuth, requirePrimaryAdmin, decideRequest);
export default router;
