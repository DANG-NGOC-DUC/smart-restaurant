import express from "express";
import { tablePublicController } from "../../controllers/public/table.public.controller.js";

const router = express.Router();

// GET /api/public/tables/scan/:token - Khách scan QR bàn (không cần auth)
router.get("/scan/:token", tablePublicController.scanTable);

export default router;
