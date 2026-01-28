import express from "express";
import * as authController from "../controllers/auth/auth.controller.js";
import * as forgotController from "../controllers/auth/forgotPassword.controller.js";
import * as resetController from "../controllers/auth/resetPassword.controller.js";

const router = express.Router();

/**
 * SIGNIN – email + password
 */
router.post("/login", authController.login);

/**
 * SIGNUP – public registration
 */
router.post("/register", authController.register);

/**
 * FORGOT PASSWORD
 */
router.post("/forgot-password", forgotController.forgotPassword);

/**
 * RESET PASSWORD
 */
router.post("/reset-password", resetController.resetPasswordController);

export default router;
