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

// Alias cũ để tránh gãy các màn hình đã dùng tên cũ
export const getKitchenItems = getPendingItems;
export const getReadyItems = getPendingItems;

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

// Bếp bắt đầu nấu (PATCH /api/staff/order-items/:itemId/cooking)
export const markItemCooking = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/cooking`);
};

// Bếp xác nhận món đã sẵn sàng (PATCH /api/staff/order-items/:itemId/ready)
export const markItemReady = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/ready`);
};

// Alias cũ
export const markItemCooked = markItemReady;

// Đánh dấu đã lên món (PATCH /api/staff/order-items/:itemId/serve)
export const markItemServed = (itemId) => {
  return api.patch(`/staff/order-items/${itemId}/serve`);
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
