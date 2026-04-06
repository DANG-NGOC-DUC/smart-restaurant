import { cashierService } from "../../services/cashier/cashier.service.js";

// ═══════════════════════════════════════════════════════════════════
// DATA-LOADING
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/cashier/tables
 * Lấy danh sách bàn kèm trạng thái cho thu ngân
 */
const getTables = async (req, res, next) => {
  try {
    const tables = await cashierService.getTables();
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cashier/tables/:tableId/orders
 * Lấy chi tiết đơn hàng của phiên đang mở tại bàn
 */
const getTableOrders = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const data = await cashierService.getTableOrders(tableId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 1. DUYỆT ĐƠN QR CỦA KHÁCH
//    PATCH /api/cashier/orders/:orderId/approve
// ═══════════════════════════════════════════════════════════════════

const approveOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await cashierService.approveOrder(orderId);

    res.status(200).json({
      message: "Đã duyệt đơn hàng thành công.",
      data: result,
    });
  } catch (error) {
    // Các lỗi nghiệp vụ → trả 400
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

// ═══════════════════════════════════════════════════════════════════
// 2. HỦY MÓN NGOẠI LỆ
//    PATCH /api/cashier/order-items/:itemId/cancel
// ═══════════════════════════════════════════════════════════════════

const cancelOrderItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await cashierService.cancelOrderItem(itemId);

    res.status(200).json({
      message: "Đã hủy món thành công.",
      data: item,
    });
  } catch (error) {
    // Lỗi nghiệp vụ: món không tồn tại, đã phục vụ, đã hủy → 400
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("Không thể hủy") ||
      error.message.includes("đã được hủy")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. THANH TOÁN & ĐÓNG PHIÊN BÀN
//    POST /api/cashier/tables/:tableId/checkout
// ═══════════════════════════════════════════════════════════════════

const checkoutTable = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const { payment_method } = req.body; // cash | transfer | momo | bank

    const result = await cashierService.checkout(tableId, payment_method);

    res.status(200).json({
      message: "Thanh toán thành công. Phiên đã được đóng.",
      data: result,
    });
  } catch (error) {
    // Lỗi nghiệp vụ: bàn không tồn tại, không có phiên, còn món chưa phục vụ → 400
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("không có phiên") ||
      error.message.includes("còn món đang nấu")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 4. YÊU CẦU HỖ TRỢ TỪ KHÁCH
// ═══════════════════════════════════════════════════════════════════

const getServiceRequests = async (req, res, next) => {
  try {
    const requests = await cashierService.getServiceRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

const resolveServiceRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const result = await cashierService.resolveServiceRequest(requestId);
    res.status(200).json({ message: "Đã xử lý yêu cầu.", data: result });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("đã được xử lý")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// 5. ĐẶT BÀN TRƯỚC
// ═══════════════════════════════════════════════════════════════════

const getReservations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const reservations = await cashierService.getReservations(status);
    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
};

const confirmReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { table_id } = req.body;
    const result = await cashierService.confirmReservation(id, table_id);
    res.status(200).json({ message: "Đã xác nhận đặt bàn.", data: result });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("Chỉ có thể")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const rejectReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await cashierService.rejectReservation(id);
    res.status(200).json({ message: "Đã từ chối đặt bàn.", data: result });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("Chỉ có thể")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const cashierController = {
  getTables,
  getTableOrders,
  approveOrder,
  cancelOrderItem,
  checkoutTable,
  getServiceRequests,
  resolveServiceRequest,
  getReservations,
  confirmReservation,
  rejectReservation,
};
