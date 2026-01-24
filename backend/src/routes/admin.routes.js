import express from "express";
import { userManagementController } from "../controllers/admin/user.management.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Route để admin cập nhật vai trò của người dùng
// PUT /api/admin/users/:userId/role
router.put(
  "/users/:userId/role",
  auth, // 1. Yêu cầu đăng nhập
  allowRoles("admin"), // 2. Chỉ cho phép vai trò 'admin'
  userManagementController.updateRole,
);

export default router;
