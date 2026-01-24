import express from "express";
import * as authController from "../controllers/auth/auth.controller.js";

const router = express.Router();

/**
 * SIGNIN – email + password
 */
router.post("/login", authController.login);

/**
 * SIGNUP – public registration
 */
router.post("/register", authController.register);

export default router;
