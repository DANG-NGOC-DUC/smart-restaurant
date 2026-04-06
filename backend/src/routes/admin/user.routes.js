import express from "express";
import { userManagementController } from "../../controllers/admin/user.management.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// GET /api/admin/users
router.get(
  "/",
  auth,
  allowRoles("admin"),
  userManagementController.getAllUsers,
);

// GET /api/admin/users/:userId
router.get(
  "/:userId",
  auth,
  allowRoles("admin"),
  userManagementController.getUserById,
);

// POST /api/admin/users
router.post(
  "/",
  auth,
  allowRoles("admin"),
  userManagementController.createUser,
);

// PUT /api/admin/users/:userId
router.put(
  "/:userId",
  auth,
  allowRoles("admin"),
  userManagementController.updateUser,
);

// DELETE /api/admin/users/:userId
router.delete(
  "/:userId",
  auth,
  allowRoles("admin"),
  userManagementController.deleteUser,
);

export default router;
