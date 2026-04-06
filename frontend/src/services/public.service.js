import { api } from "./api";

export const publicService = {
  // Menu
  getPublicMenu: (params) => api.get("/public/menu", { params }),
  getMenuGrouped: () => api.get("/public/menu/grouped"),
  getMenuItemDetail: (id) => api.get(`/public/menu/${id}`),

  // Table / QR
  scanTable: (token) => api.get(`/public/tables/scan/${token}`),

  // Orders
  createOrder: (data) => api.post("/public/orders", data),
  getOrdersBySession: (sessionId) =>
    api.get(`/public/orders/session/${sessionId}`),
  getOrderStatus: (id) => api.get(`/public/orders/${id}`),

  // Service Requests (gọi phục vụ, tính tiền)
  createServiceRequest: (data) => api.post("/public/service-requests", data),

  // Reviews
  createReview: (data) => api.post("/public/reviews", data),
  getReviewBySession: (sessionId) =>
    api.get(`/public/reviews/session/${sessionId}`),

  // Session status
  getSessionStatus: (sessionId) =>
    api.get(`/public/orders/session-status/${sessionId}`),

  // Reservations
  createReservation: (data) => api.post("/public/reservations", data),
  getMyReservations: () => api.get("/public/reservations/my"),
  cancelReservation: (id) => api.patch(`/public/reservations/${id}/cancel`),

  // Profile (guest)
  updateProfile: (data) => api.patch("/public/profile", data),
};
