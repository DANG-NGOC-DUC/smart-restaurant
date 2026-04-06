import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { updateProfile } from "../../controllers/public/profile.controller.js";

const router = express.Router();

// PATCH /api/public/profile — cập nhật tên và SĐT
router.patch("/", auth, updateProfile);

export default router;
