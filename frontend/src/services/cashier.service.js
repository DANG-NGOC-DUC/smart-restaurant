import { api } from "./api";

// ==================== DANH SÁCH BÀN ====================

// Lấy tất cả bàn kèm trạng thái (GET /api/cashier/tables)
export const getTables = () => {
  return api.get("/cashier/tables");
};

// ==================== CHI TIẾT ĐƠN HÀNG ====================

// Lấy đơn hàng của phiên đang mở tại bàn (GET /api/cashier/tables/:tableId/orders)
export const getTableOrders = (tableId) => {
  return api.get(`/cashier/tables/${tableId}/orders`);
};

// ==================== DUYỆT ĐƠN ====================

// Duyệt đơn hàng QR (PATCH /api/cashier/orders/:orderId/approve)
export const approveOrder = (orderId) => {
  return api.patch(`/cashier/orders/${orderId}/approve`);
};

// ==================== HỦY MÓN ====================

// Hủy món ngoại lệ (PATCH /api/cashier/order-items/:itemId/cancel)
export const cancelOrderItem = (itemId) => {
  return api.patch(`/cashier/order-items/${itemId}/cancel`);
};

// ==================== THANH TOÁN ====================

// Thanh toán & đóng phiên bàn (POST /api/cashier/tables/:tableId/checkout)
export const checkoutTable = (tableId, paymentMethod = "cash") => {
  return api.post(`/cashier/tables/${tableId}/checkout`, {
    payment_method: paymentMethod,
  });
};

// ==================== YÊU CẦU HỖ TRỢ ====================

// Lấy danh sách yêu cầu hỗ trợ (GET /api/cashier/service-requests)
export const getServiceRequests = () => {
  return api.get("/cashier/service-requests");
};

// Xử lý yêu cầu (PATCH /api/cashier/service-requests/:requestId/resolve)
export const resolveServiceRequest = (requestId) => {
  return api.patch(`/cashier/service-requests/${requestId}/resolve`);
};

// ==================== ĐẶT BÀN TRƯỚC ====================

export const getReservations = (status) => {
  return api.get("/cashier/reservations", { params: { status } });
};

export const confirmReservation = (id, tableId) => {
  return api.patch(`/cashier/reservations/${id}/confirm`, {
    table_id: tableId,
  });
};

export const rejectReservation = (id) => {
  return api.patch(`/cashier/reservations/${id}/reject`);
};
