import express from "express";
import tableRoutes from "./table.routes.js";
import { staffController } from "../../controllers/staff/staff.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ===== Sơ đồ bàn (mới) =====
// GET /api/staff/tables  — danh sách bàn + trạng thái + tổng tiền
router.get("/tables", auth, allowRoles("staff"), staffController.getTables);

// GET /api/staff/tables/:tableId  — chi tiết bàn + orders + items
router.get(
  "/tables/:tableId",
  auth,
  allowRoles("staff"),
  staffController.getTableDetail,
);

// ===== Thực đơn =====
// GET /api/staff/menu  — danh mục + món còn phục vụ
router.get("/menu", auth, allowRoles("staff"), staffController.getMenu);

// ===== Món chờ phục vụ =====
// GET /api/staff/pending-items
router.get(
  "/pending-items",
  auth,
  allowRoles("staff"),
  staffController.getPendingItems,
);

// GET /api/staff/kitchen-board
router.get(
  "/kitchen-board",
  auth,
  allowRoles("staff", "chef"),
  staffController.getKitchenBoard,
);

// ===== Đơn hàng chờ duyệt (khách QR order) =====
// GET /api/staff/pending-orders
router.get(
  "/pending-orders",
  auth,
  allowRoles("staff"),
  staffController.getPendingOrders,
);

// PATCH /api/staff/orders/:orderId/approve  — Duyệt đơn
router.patch(
  "/orders/:orderId/approve",
  auth,
  allowRoles("staff"),
  staffController.approveOrder,
);

// PATCH /api/staff/orders/:orderId/cancel  — Hủy đơn chờ xác nhận
router.patch(
  "/orders/:orderId/cancel",
  auth,
  allowRoles("staff"),
  staffController.cancelPendingOrder,
);

// ===== Hành động nhanh =====
// PATCH /api/staff/order-items/:itemId/cancel  — Hủy món
router.patch(
  "/order-items/:itemId/cancel",
  auth,
  allowRoles("staff"),
  staffController.cancelItem,
);

// PATCH /api/staff/order-items/:itemId/cooking  — Nhận nấu
router.patch(
  "/order-items/:itemId/cooking",
  auth,
  allowRoles("staff", "chef"),
  staffController.markItemCooking,
);

// PATCH /api/staff/order-items/:itemId/cooked  — Đã chế biến (bếp xác nhận)
router.patch(
  "/order-items/:itemId/cooked",
  auth,
  allowRoles("staff", "chef"),
  staffController.markItemCooked,
);

// GET /api/staff/serving-items  — Món đang chờ phục vụ (serving)
router.get(
  "/serving-items",
  auth,
  allowRoles("staff"),
  staffController.getServingItems,
);

// PATCH /api/staff/order-items/:itemId/revert-pending  — Hoàn tác đang nấu → chờ nấu
router.patch(
  "/order-items/:itemId/revert-pending",
  auth,
  allowRoles("staff", "chef"),
  staffController.revertItemToPreparing,
);

// PATCH /api/staff/order-items/:itemId/revert-cooking  — Hoàn tác đã xong → đang nấu
router.patch(
  "/order-items/:itemId/revert-cooking",
  auth,
  allowRoles("staff", "chef"),
  staffController.revertItemToCooking,
);

// PATCH /api/staff/order-items/:itemId/serving  — Bếp giao cho phục vụ (cooked → serving)
router.patch(
  "/order-items/:itemId/serving",
  auth,
  allowRoles("staff", "chef"),
  staffController.markItemServing,
);

// PATCH /api/staff/order-items/:itemId/confirm-receive  — Phục vụ xác nhận nhận từ bếp (serving → delivering)
router.patch(
  "/order-items/:itemId/confirm-receive",
  auth,
  allowRoles("staff"),
  staffController.confirmReceiveFromKitchen,
);

// PATCH /api/staff/order-items/:itemId/delivered  — Phục vụ xác nhận đã giao tới bàn (delivering → served)
router.patch(
  "/order-items/:itemId/delivered",
  auth,
  allowRoles("staff"),
  staffController.markItemDelivered,
);

// PATCH /api/staff/order-items/:itemId/serve  — Đã lên món (nhân viên xác nhận)
router.patch(
  "/order-items/:itemId/serve",
  auth,
  allowRoles("staff"),
  staffController.markItemServed,
);

// ===== Đặt món hộ khách =====
// POST /api/staff/orders
router.post("/orders", auth, allowRoles("staff"), staffController.createOrder);

// ===== Yêu cầu hỗ trợ từ khách hàng =====
// POST /api/staff/requests  — Tạo yêu cầu thanh toán
router.post(
  "/requests",
  auth,
  allowRoles("staff"),
  staffController.createRequest,
);

// GET /api/staff/requests  — Danh sách yêu cầu (pending + acknowledged)
router.get(
  "/requests",
  auth,
  allowRoles("staff"),
  staffController.getServiceRequests,
);

// PATCH /api/staff/requests/:requestId/acknowledge  — Nhận xử lý
router.patch(
  "/requests/:requestId/acknowledge",
  auth,
  allowRoles("staff"),
  staffController.acknowledgeRequest,
);

// PATCH /api/staff/requests/:requestId/resolve  — Hoàn tất
router.patch(
  "/requests/:requestId/resolve",
  auth,
  allowRoles("staff"),
  staffController.resolveRequest,
);

// ===== Routes cũ (session open/close/get) =====
router.use("/tables", tableRoutes);

export default router;
