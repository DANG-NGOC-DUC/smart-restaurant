import { api } from "./api";

// ==================== USERS ====================

// Lấy danh sách tất cả user (GET /api/admin/users)
export const getAllUsers = (page = 1, pageSize = 20, type = "staff") => {
  return api.get("/admin/users", { params: { page, pageSize, type } });
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

// ==================== TABLES ====================

// Lấy tất cả bàn (GET /api/admin/tables)
export const getAllTables = () => {
  return api.get("/admin/tables");
};

// Lấy tất cả bàn kèm trạng thái (GET /api/admin/tables/status)
export const getTablesWithStatus = () => {
  return api.get("/admin/tables/status");
};

// Lấy 1 bàn theo id (GET /api/admin/tables/:id)
export const getTableById = (id) => {
  return api.get(`/admin/tables/${id}`);
};

// Lấy trạng thái 1 bàn (GET /api/admin/tables/:id/status)
export const getTableStatus = (id) => {
  return api.get(`/admin/tables/${id}/status`);
};

// Tạo bàn mới (POST /api/admin/tables)
export const createTable = (data) => {
  return api.post("/admin/tables", data);
};

// Cập nhật bàn (PUT /api/admin/tables/:id)
export const updateTable = (id, data) => {
  return api.put(`/admin/tables/${id}`, data);
};

// Xóa bàn (DELETE /api/admin/tables/:id)
export const deleteTable = (id) => {
  return api.delete(`/admin/tables/${id}`);
};

// Mở phiên bàn (POST /api/admin/tables/:tableId/session/open)
export const openTableSession = (tableId) => {
  return api.post(`/admin/tables/${tableId}/session/open`, {});
};

// Đóng phiên bàn (POST /api/admin/tables/:tableId/session/close)
// force = true sẽ cancel tất cả món chưa lên rồi đóng
export const closeTableSession = (tableId, { force = false } = {}) => {
  return api.post(`/admin/tables/${tableId}/session/close`, { force });
};

// Lấy phiên đang mở của bàn (GET /api/admin/tables/:tableId/session)
export const getTableSession = (tableId) => {
  return api.get(`/admin/tables/${tableId}/session`);
};

// ==================== MENU CATEGORIES ====================

// Lấy tất cả danh mục (GET /api/admin/menu-categories)
export const getAllMenuCategories = () => {
  return api.get("/admin/menu-categories");
};

// Lấy 1 danh mục (GET /api/admin/menu-categories/:id)
export const getMenuCategoryById = (id) => {
  return api.get(`/admin/menu-categories/${id}`);
};

// Tạo danh mục (POST /api/admin/menu-categories)
export const createMenuCategory = (data) => {
  return api.post("/admin/menu-categories", data);
};

// Cập nhật danh mục (PUT /api/admin/menu-categories/:id)
export const updateMenuCategory = (id, data) => {
  return api.put(`/admin/menu-categories/${id}`, data);
};

// Xóa danh mục (DELETE /api/admin/menu-categories/:id)
export const deleteMenuCategory = (id) => {
  return api.delete(`/admin/menu-categories/${id}`);
};

// ==================== MENU ITEMS ====================

// Lấy tất cả món (GET /api/admin/menu-items?category_id=&is_available=&search=)
export const getAllMenuItems = (params = {}) => {
  return api.get("/admin/menu-items", { params });
};

// Lấy chi tiết 1 món (GET /api/admin/menu-items/:id)
export const getMenuItemById = (id) => {
  return api.get(`/admin/menu-items/${id}`);
};

// Tạo món mới (POST /api/admin/menu-items) - multipart/form-data
export const createMenuItem = (formData) => {
  return api.post("/admin/menu-items", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Cập nhật món (PUT /api/admin/menu-items/:id) - multipart/form-data
export const updateMenuItem = (id, formData) => {
  return api.put(`/admin/menu-items/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Xóa món (DELETE /api/admin/menu-items/:id)
export const deleteMenuItem = (id) => {
  return api.delete(`/admin/menu-items/${id}`);
};

// Upload ảnh món (POST /api/admin/menu-items/:id/image)
export const uploadMenuItemImage = (id, formData) => {
  return api.post(`/admin/menu-items/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Xóa ảnh món (DELETE /api/admin/menu-items/:id/image)
export const deleteMenuItemImage = (id) => {
  return api.delete(`/admin/menu-items/${id}/image`);
};

// ==================== RECIPES ====================

// Lấy công thức của 1 món (GET /api/admin/menu-items/:menuItemId/ingredients)
export const getRecipe = (menuItemId) => {
  return api.get(`/admin/menu-items/${menuItemId}/ingredients`);
};

// Gán công thức cho món (POST /api/admin/menu-items/:menuItemId/ingredients)
export const setRecipe = (menuItemId, ingredients) => {
  return api.post(`/admin/menu-items/${menuItemId}/ingredients`, {
    ingredients,
  });
};

// Cập nhật định lượng (PUT /api/admin/menu-items/:menuItemId/ingredients/:ingredientId)
export const updateRecipeItem = (menuItemId, ingredientId, data) => {
  return api.put(
    `/admin/menu-items/${menuItemId}/ingredients/${ingredientId}`,
    data,
  );
};

// Xóa nguyên liệu khỏi công thức (DELETE /api/admin/menu-items/:menuItemId/ingredients/:ingredientId)
export const removeRecipeItem = (menuItemId, ingredientId) => {
  return api.delete(
    `/admin/menu-items/${menuItemId}/ingredients/${ingredientId}`,
  );
};

// ==================== MENU ITEM VARIANTS (SIZE) ====================

// Lấy tất cả variants của 1 món (GET /api/admin/menu-items/:menuItemId/variants)
export const getMenuItemVariants = (menuItemId) => {
  return api.get(`/admin/menu-items/${menuItemId}/variants`);
};

// Tạo variant (POST /api/admin/menu-items/:menuItemId/variants)
export const createMenuItemVariant = (menuItemId, data) => {
  return api.post(`/admin/menu-items/${menuItemId}/variants`, data);
};

// Cập nhật variant (PUT /api/admin/menu-items/variants/:id)
export const updateMenuItemVariant = (id, data) => {
  return api.put(`/admin/menu-items/variants/${id}`, data);
};

// Xóa variant (DELETE /api/admin/menu-items/variants/:id)
export const deleteMenuItemVariant = (id) => {
  return api.delete(`/admin/menu-items/variants/${id}`);
};

// ==================== INGREDIENTS ====================

// Lấy tất cả nguyên liệu (GET /api/admin/ingredients)
export const getAllIngredients = () => {
  return api.get("/admin/ingredients");
};

// Lấy 1 nguyên liệu (GET /api/admin/ingredients/:id)
export const getIngredientById = (id) => {
  return api.get(`/admin/ingredients/${id}`);
};

// Tạo nguyên liệu (POST /api/admin/ingredients)
export const createIngredient = (data) => {
  return api.post("/admin/ingredients", data);
};

// Cập nhật nguyên liệu (PUT /api/admin/ingredients/:id)
export const updateIngredient = (id, data) => {
  return api.put(`/admin/ingredients/${id}`, data);
};

// Xóa nguyên liệu (DELETE /api/admin/ingredients/:id)
export const deleteIngredient = (id) => {
  return api.delete(`/admin/ingredients/${id}`);
};

// Lấy các món sử dụng nguyên liệu (GET /api/admin/ingredients/:id/dishes)
export const getIngredientDishes = (id) => {
  return api.get(`/admin/ingredients/${id}/dishes`);
};

// ==================== INVENTORY ====================

// Lấy tất cả tồn kho (GET /api/admin/inventory)
export const getAllInventory = () => {
  return api.get("/admin/inventory");
};

// Lấy nguyên liệu sắp hết (GET /api/admin/inventory/low-stock)
export const getLowStock = () => {
  return api.get("/admin/inventory/low-stock");
};

// Nhập kho (POST /api/admin/inventory/:ingredientId/add)
export const addStock = (ingredientId, amount) => {
  return api.post(`/admin/inventory/${ingredientId}/add`, { amount });
};

// Đặt lại tồn kho (POST /api/admin/inventory/:ingredientId/set)
export const setStock = (ingredientId, stock) => {
  return api.post(`/admin/inventory/${ingredientId}/set`, { stock });
};

// ==================== INVENTORY SHIFTS ====================

// Lấy ca kiểm kê đang mở (GET /api/admin/inventory-shifts/open)
export const getOpenInventoryShift = () => {
  return api.get("/admin/inventory-shifts/open");
};

// Bắt đầu ca kiểm kê (POST /api/admin/inventory-shifts)
export const startInventoryShift = (data) => {
  return api.post("/admin/inventory-shifts", data);
};

// Đóng ca kiểm kê (POST /api/admin/inventory-shifts/:shiftId/close)
export const closeInventoryShift = (shiftId, items) => {
  return api.post(`/admin/inventory-shifts/${shiftId}/close`, { items });
};

// ==================== ORDERS ====================

// Lấy tất cả orders (GET /api/admin/orders?status=)
export const getAllOrders = (params = {}) => {
  return api.get("/admin/orders", { params });
};

// Lấy lịch sử orders (GET /api/admin/orders/history?status=&from=&to=&search=&page=&limit=)
export const getOrderHistory = (params = {}) => {
  return api.get("/admin/orders/history", { params });
};

// Lấy chi tiết 1 order (GET /api/admin/orders/:id)
export const getOrderById = (id) => {
  return api.get(`/admin/orders/${id}`);
};

// Cập nhật trạng thái order (PATCH /api/admin/orders/:id/status)
export const updateOrderStatus = (id, status) => {
  return api.patch(`/admin/orders/${id}/status`, { status });
};

// ==================== DASHBOARD ====================

// Lấy thống kê hôm nay (GET /api/admin/dashboard/stats)
export const getDashboardStats = () => {
  return api.get("/admin/dashboard/stats");
};

// Lấy doanh thu 7 ngày (GET /api/admin/dashboard/weekly-revenue)
export const getDashboardWeeklyRevenue = () => {
  return api.get("/admin/dashboard/weekly-revenue");
};

// Lấy top 5 món bán chạy hôm nay (GET /api/admin/dashboard/top-dishes)
export const getDashboardTopDishes = () => {
  return api.get("/admin/dashboard/top-dishes");
};

// Lấy đơn hàng gần đây (GET /api/admin/dashboard/recent-orders)
export const getDashboardRecentOrders = () => {
  return api.get("/admin/dashboard/recent-orders");
};

// ==================== REPORTS ====================

// ==================== REVIEWS ====================

// Lấy tất cả đánh giá (GET /api/admin/reviews)
export const getAllReviews = () => {
  return api.get("/admin/reviews");
};

// Lấy 3 đánh giá mới nhất (GET /api/admin/reviews/latest)
export const getLatestReviews = () => {
  return api.get("/admin/reviews/latest");
};

// ==================== REPORTS (continued) ====================

// Lấy tổng quan KPI (GET /api/admin/reports/summary?range=7days)
export const getReportSummary = (range = "7days") => {
  return api.get("/admin/reports/summary", { params: { range } });
};

// Lấy dữ liệu biểu đồ doanh thu (GET /api/admin/reports/revenue?range=7days)
export const getRevenueChart = (range = "7days") => {
  return api.get("/admin/reports/revenue", { params: { range } });
};

// Lấy top món bán chạy (GET /api/admin/reports/top-items?range=7days&limit=10)
export const getTopItems = (range = "7days", limit = 10) => {
  return api.get("/admin/reports/top-items", { params: { range, limit } });
};

// Lấy doanh thu theo danh mục (GET /api/admin/reports/categories?range=7days)
export const getCategoryRevenue = (range = "7days") => {
  return api.get("/admin/reports/categories", { params: { range } });
};

// Lấy tỷ lệ thanh toán (GET /api/admin/reports/payment-methods?range=7days)
export const getPaymentMethods = (range = "7days") => {
  return api.get("/admin/reports/payment-methods", { params: { range } });
};

// Lấy giờ cao điểm (GET /api/admin/reports/peak-hours?range=7days)
export const getPeakHours = (range = "7days") => {
  return api.get("/admin/reports/peak-hours", { params: { range } });
};

// Lấy tiêu hao nguyên liệu (GET /api/admin/reports/inventory-consumption?range=7days)
export const getInventoryConsumption = (range = "7days") => {
  return api.get("/admin/reports/inventory-consumption", { params: { range } });
};
