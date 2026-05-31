import { staffService } from "../../services/staff/staff.service.js";

/**
 * GET /api/staff/menu
 * Lấy thực đơn (danh mục + món còn phục vụ) cho nhân viên đặt món
 */
const getMenu = async (req, res, next) => {
  try {
    const menu = await staffService.getMenuForStaff();
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/tables
 * Lấy sơ đồ bàn kèm trạng thái + tổng tiền session
 */
const getTables = async (req, res, next) => {
  try {
    const tables = await staffService.getTablesForStaff();
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/tables/:tableId
 * Lấy chi tiết bàn: session + orders + items
 */
const getTableDetail = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const detail = await staffService.getTableDetail(tableId);
    res.status(200).json(detail);
  } catch (error) {
    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/staff/pending-items
 * Lấy danh sách món chờ phục vụ (status = 'cooked')
 */
const getPendingItems = async (req, res, next) => {
  try {
    const items = await staffService.getPendingItems();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/pending-orders
 * Lấy danh sách đơn hàng chờ duyệt (orders.status = 'pending')
 */
const getPendingOrders = async (req, res, next) => {
  try {
    const orders = await staffService.getPendingOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/staff/orders/:orderId/approve
 * Duyệt đơn hàng QR: pending → active, items pending → preparing, trừ kho
 */
const approveOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await staffService.approveOrder(orderId);
    res.status(200).json({
      message: "Đã duyệt đơn hàng thành công.",
      data: order,
    });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("đã được duyệt") ||
      error.message.includes("Không thể duyệt")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/staff/orders/:orderId/cancel
 * Hủy đơn hàng QR đang chờ xác nhận (pending)
 */
const cancelPendingOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await staffService.cancelPendingOrder(orderId);
    res.status(200).json({
      message: "Đã hủy đơn hàng.",
      data: order,
    });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("Chỉ có thể hủy")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/staff/order-items/:itemId/cancel
 * Hủy món khi khách yêu cầu (preparing → cancelled)
 */
const cancelItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { reason } = req.body;
    const staffId = req.user?.id || null;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Vui lòng chọn lý do hủy món." });
    }

    const item = await staffService.cancelItem(itemId, reason, staffId);
    res.status(200).json({
      message: "Đã hủy món thành công.",
      data: item,
    });
  } catch (error) {
    if (
      error.message.includes("Không tìm thấy") ||
      error.message.includes("Không thể hủy") ||
      error.message.includes("đã được cập nhật")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/staff/order-items/:itemId/cooking
 * Bếp xác nhận đã nhận nấu (preparing → cooking)
 */
const markItemCooking = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await staffService.markItemCooking(itemId);
    res.status(200).json({
      message: "Đã nhận nấu món.",
      data: item,
    });
  } catch (error) {
    if (
      error.message.includes("Không tìm thấy") ||
      error.message.includes("Không thể nhận")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/staff/order-items/:itemId/cooked
 * Bếp xác nhận đã chế biến xong (cooking → cooked)
 */
const markItemCooked = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await staffService.markItemCooked(itemId);
    res.status(200).json({
      message: "Đã xác nhận chế biến xong.",
      data: item,
    });
  } catch (error) {
    if (
      error.message.includes("Không tìm thấy") ||
      error.message.includes("Không thể xác nhận")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/staff/order-items/:itemId/serve
 * Nhân viên xác nhận đã lên món (cooked → served)
 */
const markItemServed = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await staffService.markItemServed(itemId);
    res.status(200).json({
      message: "Đã lên món thành công.",
      data: item,
    });
  } catch (error) {
    if (
      error.message.includes("Không tìm thấy") ||
      error.message.includes("Không thể lên món")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/staff/orders
 * Nhân viên đặt món hộ khách
 * Body: { tableId: string, items: [{ itemId, quantity, note? }] }
 */
const createOrder = async (req, res, next) => {
  try {
    const { tableId, items } = req.body;

    // ── Early validation (400 ngay tại controller) ──────────
    if (!tableId) {
      return res.status(400).json({ error: "tableId là bắt buộc." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Danh sách món (items) không được rỗng." });
    }

    // Truyền staffId từ user đã xác thực (middleware auth)
    const staffId = req.user?.id || null;

    const result = await staffService.createOrderForTable(
      tableId,
      items,
      staffId,
    );

    res.status(201).json({
      message: "Đặt món thành công.",
      data: result,
    });
  } catch (error) {
    // Các lỗi validation / business logic → 400
    if (
      error.message.includes("bắt buộc") ||
      error.message.includes("không được rỗng") ||
      error.message.includes("không tồn tại") ||
      error.message.includes("không hoạt động") ||
      error.message.includes("không còn phục vụ") ||
      error.message.includes("phải >= 1") ||
      error.message.includes("chờ dọn")
    ) {
      return res.status(400).json({ error: error.message });
    }
    // Lỗi Supabase / unexpected → 500
    next(error);
  }
};

/**
 * GET /api/staff/requests
 * Lấy danh sách yêu cầu hỗ trợ (pending + acknowledged)
 */
const getServiceRequests = async (req, res, next) => {
  try {
    const requests = await staffService.getServiceRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/staff/requests/:requestId/acknowledge
 * Nhân viên nhận xử lý yêu cầu hỗ trợ từ khách
 */
const acknowledgeRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const staffId = req.user?.id;

    const result = await staffService.acknowledgeRequest(requestId, staffId);
    res.status(200).json({
      message: "Đã nhận xử lý yêu cầu.",
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("đã có nhân viên") ||
      error.message.includes("đã được giải quyết") ||
      error.message.includes("Không thể nhận")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/staff/requests/:requestId/resolve
 * Nhân viên đánh dấu đã hoàn tất yêu cầu
 */
const resolveRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const staffId = req.user?.id;

    const result = await staffService.resolveRequest(requestId, staffId);
    res.status(200).json({
      message: "Đã hoàn tất yêu cầu hỗ trợ.",
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("chưa được nhận") ||
      error.message.includes("đã được giải quyết") ||
      error.message.includes("không phải người nhận") ||
      error.message.includes("Không thể hoàn tất")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/staff/requests
 * Nhân viên tạo yêu cầu thanh toán cho bàn
 * Body: { tableId, requestType? }
 */
const createRequest = async (req, res, next) => {
  try {
    const { tableId, requestType } = req.body;
    const staffId = req.user?.id || null;

    if (!tableId) {
      return res.status(400).json({ error: "tableId là bắt buộc." });
    }

    const result = await staffService.createPaymentRequest(
      tableId,
      requestType || "request_bill",
      staffId,
    );

    res.status(201).json({
      message: "Đã gửi yêu cầu thanh toán.",
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes("bắt buộc") ||
      error.message.includes("không tồn tại") ||
      error.message.includes("chưa có phiên") ||
      error.message.includes("đã có yêu cầu")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const staffController = {
  getTables,
  getTableDetail,
  getMenu,
  getPendingItems,
  getPendingOrders,
  approveOrder,
  cancelPendingOrder,
  cancelItem,
  markItemCooking,
  markItemCooked,
  markItemServed,
  createOrder,
  createRequest,
  acknowledgeRequest,
  resolveRequest,
  getServiceRequests,
};
