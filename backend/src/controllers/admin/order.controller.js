import { orderService } from "../../services/admin/order.service.js";

const getAllOrders = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const orders = await orderService.getAllOrders(filters);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.from) filters.from = req.query.from;
    if (req.query.to) filters.to = req.query.to;
    if (req.query.search) filters.search = req.query.search;
    if (req.query.page) filters.page = req.query.page;
    if (req.query.limit) filters.limit = req.query.limit;

    const result = await orderService.getOrderHistory(filters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Order không tồn tại." });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Trạng thái mới là bắt buộc." });
    }

    const updated = await orderService.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "Order không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (
      error.message.includes("không hợp lệ") ||
      error.message.includes("Không thể") ||
      error.message.includes("Không đủ tồn kho")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const orderController = {
  getAllOrders,
  getOrderHistory,
  getOrderById,
  updateOrderStatus,
};
