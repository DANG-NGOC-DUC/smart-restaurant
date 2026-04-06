import express from "express";
import { orderController } from "../../controllers/admin/order.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth, allowRoles("admin"));

// GET /api/admin/orders?status=pending
router.get("/", orderController.getAllOrders);

// GET /api/admin/orders/history?status=&from=&to=&search=&page=&limit=
router.get("/history", orderController.getOrderHistory);

// GET /api/admin/orders/:id
router.get("/:id", orderController.getOrderById);

// PATCH /api/admin/orders/:id/status
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;
