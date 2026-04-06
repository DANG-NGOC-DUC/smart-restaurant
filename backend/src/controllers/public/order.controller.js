import { orderPublicService } from "../../services/public/order.service.js";

/**
 * POST /api/public/orders
 * Body: { session_id, items: [{ menu_item_id, quantity, note? }] }
 */
const createOrder = async (req, res) => {
  try {
    const { session_id, items } = req.body;
    const order = await orderPublicService.createOrder({ session_id, items });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/public/orders/session/:sessionId
 * Lấy tất cả orders + items của phiên (thực khách xem trạng thái)
 */
const getOrdersBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const orders = await orderPublicService.getOrdersBySession(sessionId);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/public/orders/:id
 * Lấy trạng thái 1 order
 */
const getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderPublicService.getOrderStatus(id);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/public/orders/session-status/:sessionId
 */
const getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const data = await orderPublicService.getSessionStatus(sessionId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const orderPublicController = {
  createOrder,
  getOrdersBySession,
  getOrderStatus,
  getSessionStatus,
};
