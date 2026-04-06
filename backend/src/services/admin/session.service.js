import { SessionModel } from "../../models/session.model.js";
import { TableModel } from "../../models/table.model.js";
import knex from "../../db/knex.js";
import { orderService } from "./order.service.js";

// Mở phiên cho bàn
const openSession = async (tableId, userId) => {
  const table = await TableModel.findById(tableId);
  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  if (!table.is_active) {
    throw new Error("Bàn đang không hoạt động.");
  }

  const activeSession = await SessionModel.findActiveByTableId(tableId);
  if (activeSession) {
    throw new Error("Bàn đang có khách, không thể mở phiên mới.");
  }

  return SessionModel.create({
    table_id: tableId,
    user_id: userId || null,
    started_at: new Date(),
  });
};

// Đóng phiên — kiểm tra món chưa lên, hỗ trợ force close
const closeSession = async (tableId, { force = false } = {}) => {
  const activeSession = await SessionModel.findActiveByTableId(tableId);
  if (!activeSession) {
    throw new Error("Bàn này không có phiên nào đang mở.");
  }

  // Tìm tất cả order_items chưa served/cancelled trong phiên này
  const unservedItems = await knex("order_items")
    .join("orders", "orders.id", "order_items.order_id")
    .join("menu_items", "menu_items.id", "order_items.menu_item_id")
    .where("orders.session_id", activeSession.id)
    .whereNotIn("order_items.status", ["served", "cancelled"])
    .select(
      "order_items.id",
      "menu_items.name",
      "order_items.quantity",
      "order_items.status",
    );

  // Nếu còn món chưa lên và chưa force → trả lỗi kèm danh sách
  if (unservedItems.length > 0 && !force) {
    const err = new Error("UNSERVED_ITEMS");
    err.unservedItems = unservedItems;
    err.unservedCount = unservedItems.length;
    throw err;
  }

  // Force close hoặc không có món dở → dùng transaction
  return knex.transaction(async (trx) => {
    // Lấy tất cả orders chưa hoàn tất / hủy trong phiên
    const activeOrderIds = await trx("orders")
      .where("session_id", activeSession.id)
      .whereNotIn("status", ["completed", "cancelled"])
      .pluck("id");

    if (unservedItems.length > 0) {
      // Cancel tất cả order_items chưa xong
      const itemIds = unservedItems.map((i) => i.id);
      await trx("order_items")
        .whereIn("id", itemIds)
        .update({ status: "cancelled" });

      // Hoàn tồn kho cho các order có items preparing bị cancel
      for (const orderId of activeOrderIds) {
        try {
          await orderService.restoreInventoryForOrder(orderId);
        } catch {
          // Bỏ qua lỗi tồn kho khi force close
        }
      }
    }

    // Đánh dấu tất cả orders active → completed (đã kết thúc phiên)
    if (activeOrderIds.length > 0) {
      await trx("orders")
        .whereIn("id", activeOrderIds)
        .update({ status: "completed" });
    }

    // Đóng phiên
    const [closed] = await trx("sessions")
      .where("id", activeSession.id)
      .update({ ended_at: new Date(), status: "closed" })
      .returning("*");

    return closed;
  });
};

// Lấy phiên đang mở của bàn
const getActiveSession = async (tableId) => {
  const table = await TableModel.findById(tableId);
  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  const session = await SessionModel.findActiveByTableId(tableId);
  return session || null;
};

export const sessionService = {
  openSession,
  closeSession,
  getActiveSession,
};
