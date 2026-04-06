import knex from "../../db/knex.js";
import crypto from "crypto";
import { SessionModel } from "../../models/session.model.js";
import { MenuItemModel } from "../../models/menuItem.model.js";
import { MenuItemVariantModel } from "../../models/menuItemVariant.model.js";
import { orderService } from "../admin/order.service.js";

/**
 * Thực khách QR tạo order:
 *  - Lần đầu trong phiên → status = pending, items = pending (chờ staff/cashier duyệt)
 *  - Từ lần 2 trở đi    → status = active, items = preparing (gửi thẳng xuống bếp)
 *
 * body: { session_id, items: [{ menu_item_id, quantity, note?, variant_id? }] }
 */
const createOrder = async ({ session_id, items }) => {
  if (!session_id) throw new Error("Thiếu session_id.");
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Đơn hàng phải có ít nhất 1 món.");

  // Validate session
  const session = await SessionModel.findById(session_id);
  if (!session) throw new Error("Phiên không tồn tại.");
  if (session.status !== "open")
    throw new Error("Phiên đã kết thúc, không thể đặt thêm.");

  // Validate + lấy giá từng món
  const orderItems = [];
  for (const item of items) {
    if (!item.menu_item_id || !item.quantity || item.quantity < 1)
      throw new Error("Thông tin món không hợp lệ.");

    const menuItem = await MenuItemModel.findById(item.menu_item_id);
    if (!menuItem) throw new Error(`Món không tồn tại: ${item.menu_item_id}`);
    if (!menuItem.is_available)
      throw new Error(`Món "${menuItem.name}" hiện đang ngừng bán.`);

    // Xử lý variant (size)
    let priceExtra = 0;
    let variantId = null;
    let variantLabel = null;

    if (item.variant_id) {
      const variant = await MenuItemVariantModel.findById(item.variant_id);
      if (!variant) throw new Error("Biến thể không tồn tại.");
      if (variant.menu_item_id !== item.menu_item_id)
        throw new Error("Biến thể không thuộc món này.");
      if (!variant.is_available)
        throw new Error(`Biến thể "${variant.label}" hiện không khả dụng.`);
      priceExtra = Number(variant.price_extra);
      variantId = variant.id;
      variantLabel = variant.label;
    }

    orderItems.push({
      id: crypto.randomUUID(),
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      price: Number(menuItem.price) + priceExtra,
      status: "pending", // sẽ được ghi đè bên dưới
      note: item.note || null,
      variant_id: variantId,
      variant_label: variantLabel,
    });
  }

  // Tính tổng
  const totalPrice = orderItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0,
  );

  // Kiểm tra phiên này đã có order được duyệt chưa
  // Lần đầu → pending (cần duyệt), lần 2+ → active (gửi thẳng bếp)
  const approvedCount = await knex("orders")
    .where({ session_id })
    .whereIn("status", ["active", "completed"])
    .count("id as cnt")
    .first();

  const isFirstOrder = Number(approvedCount.cnt) === 0;
  const orderStatus = isFirstOrder ? "pending" : "active";
  const itemStatus = isFirstOrder ? "pending" : "preparing";

  // Gán status cho items
  orderItems.forEach((oi) => {
    oi.status = itemStatus;
  });

  // Tạo order + items trong transaction
  const order = await knex.transaction(async (trx) => {
    const orderId = crypto.randomUUID();

    const [created] = await trx("orders")
      .insert({
        id: orderId,
        session_id,
        total_price: totalPrice,
        status: orderStatus,
      })
      .returning("*");

    const itemsToInsert = orderItems.map((i) => ({
      ...i,
      order_id: orderId,
    }));
    await trx("order_items").insert(itemsToInsert);

    // Nếu gửi thẳng bếp (lần 2+), trừ kho luôn
    if (!isFirstOrder) {
      await orderService.deductInventoryForOrder(orderId);
    }

    return { ...created, is_first_order: isFirstOrder };
  });

  return order;
};

/**
 * Lấy tất cả orders + items của 1 session (dành cho thực khách xem trạng thái)
 */
const getOrdersBySession = async (sessionId) => {
  const session = await SessionModel.findById(sessionId);
  if (!session) throw new Error("Phiên không tồn tại.");

  const orders = await knex("orders")
    .where({ session_id: sessionId })
    .orderBy("created_at", "desc");

  // Lấy items kèm tên món cho tất cả orders
  const orderIds = orders.map((o) => o.id);
  const allItems =
    orderIds.length > 0
      ? await knex("order_items")
          .leftJoin("menu_items", "menu_items.id", "order_items.menu_item_id")
          .whereIn("order_items.order_id", orderIds)
          .select(
            "order_items.*",
            "menu_items.name as menu_item_name",
            "menu_items.image_url",
          )
      : [];

  // Group items theo order
  const ordersWithItems = orders.map((order) => ({
    ...order,
    items: allItems.filter((i) => i.order_id === order.id),
  }));

  return ordersWithItems;
};

/**
 * Lấy trạng thái 1 order
 */
const getOrderStatus = async (orderId) => {
  const order = await knex("orders").where({ id: orderId }).first();
  if (!order) throw new Error("Đơn hàng không tồn tại.");

  const items = await knex("order_items")
    .leftJoin("menu_items", "menu_items.id", "order_items.menu_item_id")
    .where("order_items.order_id", orderId)
    .select(
      "order_items.*",
      "menu_items.name as menu_item_name",
      "menu_items.image_url",
    );

  return { ...order, items };
};

/**
 * Lấy trạng thái session (để frontend detect khi cashier đóng phiên)
 */
const getSessionStatus = async (sessionId) => {
  const session = await SessionModel.findById(sessionId);
  if (!session) throw new Error("Phiên không tồn tại.");
  return { status: session.status };
};

export const orderPublicService = {
  createOrder,
  getOrdersBySession,
  getOrderStatus,
  getSessionStatus,
};
