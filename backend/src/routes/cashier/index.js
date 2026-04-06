import express from "express";
import { cashierController } from "../../controllers/cashier/cashier.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ===== Danh sách bàn =====
// GET /api/cashier/tables
router.get("/tables", auth, allowRoles("cashier"), cashierController.getTables);

// ===== Chi tiết đơn hàng của bàn =====
// GET /api/cashier/tables/:tableId/orders
router.get(
  "/tables/:tableId/orders",
  auth,
  allowRoles("cashier"),
  cashierController.getTableOrders,
);

// ===== Duyệt đơn QR của khách =====
// PATCH /api/cashier/orders/:orderId/approve
router.patch(
  "/orders/:orderId/approve",
  auth,
  allowRoles("cashier"),
  cashierController.approveOrder,
);

// ===== Hủy món ngoại lệ =====
// PATCH /api/cashier/order-items/:itemId/cancel
router.patch(
  "/order-items/:itemId/cancel",
  auth,
  allowRoles("cashier"),
  cashierController.cancelOrderItem,
);

// ===== Thanh toán & đóng phiên bàn =====
// POST /api/cashier/tables/:tableId/checkout
router.post(
  "/tables/:tableId/checkout",
  auth,
  allowRoles("cashier"),
  cashierController.checkoutTable,
);

// ===== Đặt bàn trước =====
// GET /api/cashier/reservations
router.get(
  "/reservations",
  auth,
  allowRoles("cashier"),
  cashierController.getReservations,
);

// PATCH /api/cashier/reservations/:id/confirm
router.patch(
  "/reservations/:id/confirm",
  auth,
  allowRoles("cashier"),
  cashierController.confirmReservation,
);

// PATCH /api/cashier/reservations/:id/reject
router.patch(
  "/reservations/:id/reject",
  auth,
  allowRoles("cashier"),
  cashierController.rejectReservation,
);

// ===== Yêu cầu hỗ trợ từ khách =====
// GET /api/cashier/service-requests
router.get(
  "/service-requests",
  auth,
  allowRoles("cashier"),
  cashierController.getServiceRequests,
);

// PATCH /api/cashier/service-requests/:requestId/resolve
router.patch(
  "/service-requests/:requestId/resolve",
  auth,
  allowRoles("cashier"),
  cashierController.resolveServiceRequest,
);

export default router;
