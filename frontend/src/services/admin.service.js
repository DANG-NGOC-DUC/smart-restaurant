import { api } from "./api";

// Lấy danh sách tất cả user (GET /api/admin/users)
export const getAllUsers = (page = 1, pageSize = 20) => {
  return api.get("/admin/users", { params: { page, pageSize } });
};

// Lấy thông tin 1 user theo id (GET /api/admin/users/:userId)
export const getUserById = (userId) => {
  return api.get(`/admin/users/${userId}`);
};

// Xóa user theo id (DELETE /api/admin/users/:userId)
export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

// Cập nhật toàn bộ thông tin user (PUT /api/admin/users/:userId)
export const updateUser = (userId, data) => {
  return api.put(`/admin/users/${userId}`, data);
};

// Tạo user mới (POST /api/admin/users)
export const createUser = (data) => {
  return api.post("/admin/users", data);
};
