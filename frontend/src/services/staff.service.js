import { api } from "./api";

// ==================== SƠ ĐỒ BÀN ====================

// Lấy tất cả bàn kèm trạng thái + tổng tiền (GET /api/staff/tables)
export const getTables = () => {
  return api.get("/staff/tables");
};

// Lấy chi tiết bàn: session + orders + items (GET /api/staff/tables/:tableId)
export const getTableDetail = (tableId) => {
  return api.get(`/staff/tables/${tableId}`);
};

// ==================== SESSIONS ====================

// Mở phiên cho bàn (POST /api/staff/tables/:tableId/session/open)
export const openSession = (tableId, userId = null) => {
  return api.post(`/staff/tables/${tableId}/session/open`, {
    user_id: userId,
  });
};

// Đóng phiên cho bàn (POST /api/staff/tables/:tableId/session/close)
export const closeSession = (tableId) => {
  return api.post(`/staff/tables/${tableId}/session/close`);
};

// ==================== MÓN ĂN ====================

// Lấy thực đơn (danh mục + món còn phục vụ) (GET /api/staff/menu)
export const getMenu = () => {
  return api.get("/staff/menu");
};

// Lấy danh sách món chờ phục vụ (GET /api/staff/pending-items)
export const getPendingItems = () => {
  return api.get("/staff/pending-items");
};

// Lấy danh sách món đã nấu xong (GET /api/staff/pending-items)
export const getReadyItems = () => {
  return api.get("/staff/pending-items");
};

// Lấy danh sách món đang chờ phục vụ (GET /api/staff/serving-items)
export const getServingItems = () => {
  return api.get("/staff/serving-items");
};

// Lấy dữ liệu bảng bếp (GET /api/staff/kitchen-board)
export const getKitchenBoard = () => {
  return api.get("/staff/kitchen-board");
};

// Lấy thống kê tổng quan bếp (GET /api/staff/kitchen-stats)
export const getKitchenStats = () => {
  return api.get("/staff/kitchen-stats");
};

// Lấy lịch sử món chi tiết (GET /api/staff/kitchen-history)
export const getKitchenHistory = (params) => {
  return api.get("/staff/kitchen-history", { params });
};

// Đổi trạng thái khả dụng của món ăn (PATCH /api/staff/menu-items/:id/availability)
export const toggleMenuItemAvailability = (itemId, is_available) => {
  return api.patch(`/staff/menu-items/${itemId}/availability`, { is_available });
};

// ==================== DUYỆT ĐƠN ====================

// Lấy danh sách đơn chờ duyệt (GET /api/staff/pending-orders)
export const getPendingOrders = () => {
  return api.get("/staff/pending-orders");
};

// Duyệt đơn (PATCH /api/staff/orders/:orderId/approve)
export const approveOrder = (orderId) => {
  return api.patch(`/staff/orders/${orderId}/approve`);
};

// Hủy đơn chờ xác nhận (PATCH /api/staff/orders/:orderId/cancel)
export const cancelPendingOrder = (orderId) => {
  return api.patch(`/staff/orders/${orderId}/cancel`);
};

// Hủy món (PATCH /api/staff/order-items/:itemId/cancel)
export const cancelItem = (itemId, reason) => {
  return api.patch(`/staff/order-items/${itemId}/cancel`, { reason });
};

// Bếp nhận nấu (PATCH /api/staff/order-items/:itemId/cooking)
export const markItemCooking = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/cooking`);
};

// Bếp xác nhận món đã nấu xong (PATCH /api/staff/order-items/:itemId/cooked)
export const markItemReady = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/cooked`);
};

// Bếp chuyển món sang chờ phục vụ (PATCH /api/staff/order-items/:itemId/serving)
export const markItemServing = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/serving`);
};

// Bếp hoàn tác món đang nấu về chờ nấu (PATCH /api/staff/order-items/:itemId/revert-pending)
export const revertItemToPreparing = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/revert-pending`);
};

// Bếp hoàn tác món đã xong về đang nấu (PATCH /api/staff/order-items/:itemId/revert-cooking)
export const revertItemToCooking = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/revert-cooking`);
};

// Đánh dấu đã lên món (PATCH /api/staff/order-items/:itemId/serve)
export const markItemServed = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/serve`);
};

// Phục vụ xác nhận đã nhận từ bếp (PATCH /api/staff/order-items/:itemId/confirm-receive)
export const confirmReceive = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/confirm-receive`);
};

// Phục vụ xác nhận đã giao tới bàn (PATCH /api/staff/order-items/:itemId/delivered)
export const markItemDelivered = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/delivered`);
};

// ==================== ĐẶT MÓN ====================

// Nhân viên đặt món hộ khách (POST /api/staff/orders)
export const createOrder = (tableId, items) => {
  return api.post("/staff/orders", { tableId, items });
};

// ==================== YÊU CẦU HỖ TRỢ ====================

// Nhân viên gửi yêu cầu thanh toán lên thu ngân (POST /api/staff/requests)
export const createPaymentRequest = (tableId) => {
  return api.post("/staff/requests", {
    tableId,
    requestType: "request_bill",
  });
};

// Lấy danh sách yêu cầu hỗ trợ (GET /api/staff/requests)
export const getServiceRequests = () => {
  return api.get("/staff/requests");
};

// Nhận xử lý yêu cầu (PATCH /api/staff/requests/:requestId/acknowledge)
export const acknowledgeRequest = (requestId) => {
  return api.patch(`/staff/requests/${requestId}/acknowledge`);
};

// Hoàn tất yêu cầu (PATCH /api/staff/requests/:requestId/resolve)
export const resolveRequest = (requestId) => {
  return api.patch(`/staff/requests/${requestId}/resolve`);
};
