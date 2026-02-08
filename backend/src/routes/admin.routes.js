import express from "express";
import { userManagementController } from "../controllers/admin/user.management.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Route to get all users
// GET /api/admin/users
router.get(
  "/users",
  auth,
  allowRoles("admin"),
  userManagementController.getAllUsers,
);

// Route to get a single user by ID
// GET /api/admin/users/:userId
router.get(
  "/users/:userId",
  auth,
  allowRoles("admin"),
  userManagementController.getUserById,
);

// Route to delete a user
// DELETE /api/admin/users/:userId
router.delete(
  "/users/:userId",
  auth,
  allowRoles("admin"),
  userManagementController.deleteUser,
);

// Route để admin cập nhật vai trò của người dùng
// PUT /api/admin/users/:userId/role
// Route để admin cập nhật thông tin người dùng
// PUT /api/admin/users/:userId
router.put(
  "/users/:userId",
  auth, // 1. Yêu cầu đăng nhập
  allowRoles("admin"), // 2. Chỉ cho phép vai trò 'admin'
  userManagementController.updateUser,
);

// Route để admin tạo người dùng mới
// POST /api/admin/users
router.post(
  "/users",
  auth,
  allowRoles("admin"),
  userManagementController.createUser,
);
export default router;
