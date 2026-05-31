import express from "express";
import { cashierController } from "../../controllers/cashier/cashier.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { requirePermission } from "../../middlewares/permission.middleware.js";

const router = express.Router();

// ===== Danh sách bàn =====
// GET /api/cashier/tables
router.get(
  "/tables",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.tables.read"),
  cashierController.getTables,
);

// ===== Chi tiết đơn hàng của bàn =====
// GET /api/cashier/tables/:tableId/orders
router.get(
  "/tables/:tableId/orders",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.orders.read"),
  cashierController.getTableOrders,
);

// ===== Duyệt đơn QR của khách =====
// PATCH /api/cashier/orders/:orderId/approve
router.patch(
  "/orders/:orderId/approve",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.orders.approve"),
  cashierController.approveOrder,
);

// ===== Hủy đơn QR chờ xác nhận =====
// PATCH /api/cashier/orders/:orderId/cancel
router.patch(
  "/orders/:orderId/cancel",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.orders.approve"),
  cashierController.cancelPendingOrder,
);

// ===== Hủy món ngoại lệ =====
// PATCH /api/cashier/order-items/:itemId/cancel
router.patch(
  "/order-items/:itemId/cancel",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.order_items.cancel"),
  cashierController.cancelOrderItem,
);

// ===== Thanh toán & đóng phiên bàn =====
// POST /api/cashier/tables/:tableId/checkout
router.post(
  "/tables/:tableId/checkout",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.checkout"),
  cashierController.checkoutTable,
);

// ===== Đặt bàn trước =====
// GET /api/cashier/reservations
router.get(
  "/reservations",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.reservations.read"),
  cashierController.getReservations,
);

// PATCH /api/cashier/reservations/:id/confirm
router.patch(
  "/reservations/:id/confirm",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.reservations.confirm"),
  cashierController.confirmReservation,
);

// PATCH /api/cashier/reservations/:id/reject
router.patch(
  "/reservations/:id/reject",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.reservations.reject"),
  cashierController.rejectReservation,
);

// ===== Yêu cầu hỗ trợ từ khách =====
// GET /api/cashier/service-requests
router.get(
  "/service-requests",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.service_requests.read"),
  cashierController.getServiceRequests,
);

// PATCH /api/cashier/service-requests/:requestId/resolve
router.patch(
  "/service-requests/:requestId/resolve",
  auth,
  allowRoles("staff", "admin"),
  requirePermission("cashier.service_requests.resolve"),
  cashierController.resolveServiceRequest,
);

export default router;
