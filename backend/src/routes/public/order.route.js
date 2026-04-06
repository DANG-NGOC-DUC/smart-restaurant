import express from "express";
import { orderPublicController } from "../../controllers/public/order.controller.js";

const router = express.Router();

// POST /api/public/orders — Thực khách QR đặt món (tạo order pending)
router.post("/", orderPublicController.createOrder);

// GET /api/public/orders/session-status/:sessionId — Kiểm tra trạng thái phiên
router.get(
  "/session-status/:sessionId",
  orderPublicController.getSessionStatus,
);

// GET /api/public/orders/session/:sessionId — Xem tất cả món của bàn
router.get("/session/:sessionId", orderPublicController.getOrdersBySession);

// GET /api/public/orders/:id — Xem trạng thái 1 order
router.get("/:id", orderPublicController.getOrderStatus);

export default router;
