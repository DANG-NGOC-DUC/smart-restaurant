import knex from "../../db/knex.js";
import { OrderModel } from "../../models/order.model.js";
import { OrderItemModel } from "../../models/orderItem.model.js";
import { MenuItemIngredientModel } from "../../models/menuItemIngredient.model.js";
import { InventoryModel } from "../../models/inventory.model.js";
import { MenuItemVariantModel } from "../../models/menuItemVariant.model.js";

/**
 * Lấy tất cả orders (có thể lọc theo status)
 * Mặc định chỉ trả orders từ session đang mở (open).
 * Truyền filters.allSessions = true để lấy cả session đã đóng.
 */
const getAllOrders = async (filters = {}) => {
  const query = knex("orders")
    .leftJoin("sessions", "sessions.id", "orders.session_id")
    .leftJoin("tables", "tables.id", "sessions.table_id")
    .select("orders.*", "tables.name as table_name")
    .orderBy("orders.created_at", "desc");

  // Mặc định chỉ lấy orders từ session đang mở
  if (!filters.allSessions) {
    query.where(function () {
      this.where("sessions.status", "open").orWhereNull("sessions.id");
    });
  }

  if (filters.status) {
    query.where("orders.status", filters.status);
  }

  const orders = await query;

  // Đếm số món + thống kê trạng thái items cho mỗi order
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);

    // Tổng số món (không tính cancelled)
    const itemCounts = await knex("order_items")
      .whereIn("order_id", orderIds)
      .whereNot("status", "cancelled")
      .select("order_id", knex.raw("SUM(quantity) as item_count"))
      .groupBy("order_id");
    const countMap = {};
    itemCounts.forEach((c) => (countMap[c.order_id] = parseInt(c.item_count)));

    // Đếm số món đang nấu (preparing) và đã phục vụ (served)
    const statusCounts = await knex("order_items")
      .whereIn("order_id", orderIds)
      .whereNot("status", "cancelled")
      .select("order_id", "status", knex.raw("COUNT(*) as cnt"))
      .groupBy("order_id", "status");

    const preparingMap = {};
    const servedMap = {};
    statusCounts.forEach((c) => {
      if (c.status === "preparing") preparingMap[c.order_id] = parseInt(c.cnt);
      if (c.status === "served") servedMap[c.order_id] = parseInt(c.cnt);
    });

    orders.forEach((o) => {
      o.item_count = countMap[o.id] || 0;
      o.preparing_count = preparingMap[o.id] || 0;
      o.served_count = servedMap[o.id] || 0;
    });
  }

  return orders;
};

/**
 * Lấy lịch sử orders (session đã đóng) — có pagination + date filter + search
 * filters: { status, from, to, search, page, limit }
 */
const getOrderHistory = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  // Base query — chỉ lấy orders từ session đã đóng (closed) hoặc orphan
  const baseQuery = () =>
    knex("orders")
      .leftJoin("sessions", "sessions.id", "orders.session_id")
      .leftJoin("tables", "tables.id", "sessions.table_id")
      .where(function () {
        this.where("sessions.status", "closed").orWhereNull("sessions.id");
      });

  // Apply shared filters
  const applyFilters = (q) => {
    if (filters.status) {
      q.where("orders.status", filters.status);
    }
    if (filters.from) {
      q.where("orders.created_at", ">=", filters.from);
    }
    if (filters.to) {
      // to = ngày kết thúc, cộng 1 ngày để bao gồm cả ngày đó
      const toDate = new Date(filters.to);
      toDate.setDate(toDate.getDate() + 1);
      q.where("orders.created_at", "<", toDate.toISOString().split("T")[0]);
    }
    if (filters.search) {
      const s = `%${filters.search}%`;
      q.where(function () {
        this.whereILike("tables.name", s).orWhere(
          knex.raw("orders.id::text"),
          "ilike",
          s,
        );
      });
    }
    return q;
  };

  // Count total
  const countQuery = applyFilters(baseQuery())
    .count("orders.id as total")
    .first();
  const { total } = await countQuery;
  const totalCount = parseInt(total);

  // Fetch page
  const dataQuery = applyFilters(baseQuery())
    .select("orders.*", "tables.name as table_name")
    .orderBy("orders.created_at", "desc")
    .limit(limit)
    .offset(offset);

  const orders = await dataQuery;

  // Attach item counts (same logic as getAllOrders)
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);

    const itemCounts = await knex("order_items")
      .whereIn("order_id", orderIds)
      .whereNot("status", "cancelled")
      .select("order_id", knex.raw("SUM(quantity) as item_count"))
      .groupBy("order_id");
    const countMap = {};
    itemCounts.forEach((c) => (countMap[c.order_id] = parseInt(c.item_count)));

    orders.forEach((o) => {
      o.item_count = countMap[o.id] || 0;
    });
  }

  // Summary stats for the filtered range
  const summaryQuery = applyFilters(baseQuery());
  const summary = await summaryQuery.select(
    knex.raw("COUNT(*) as total_orders"),
    knex.raw(
      "COUNT(*) FILTER (WHERE orders.status = 'completed') as completed_orders",
    ),
    knex.raw(
      "COUNT(*) FILTER (WHERE orders.status = 'cancelled') as cancelled_orders",
    ),
    knex.raw(
      "COALESCE(SUM(orders.total_price) FILTER (WHERE orders.status = 'completed'), 0) as total_revenue",
    ),
  );

  return {
    orders,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    summary: {
      total_orders: parseInt(summary[0].total_orders),
      completed_orders: parseInt(summary[0].completed_orders),
      cancelled_orders: parseInt(summary[0].cancelled_orders),
      total_revenue: parseFloat(summary[0].total_revenue),
    },
  };
};

/**
 * Lấy chi tiết 1 order kèm items
 * order_items.status: preparing | served | cancelled
 */
const getOrderById = async (id) => {
  const order = await knex("orders")
    .leftJoin("sessions", "sessions.id", "orders.session_id")
    .leftJoin("tables", "tables.id", "sessions.table_id")
    .where("orders.id", id)
    .select("orders.*", "tables.name as table_name")
    .first();

  if (!order) return null;

  const items = await OrderItemModel.findByOrderWithDetails(order.id);
  return { ...order, items };
};

/**
 * Cập nhật trạng thái order
 * Luồng: pending → active (duyệt) | cancelled (hủy)
 *        active → completed (thanh toán) | cancelled (hủy)
 * Khi duyệt pending → active: chuyển items pending → preparing + trừ kho
 * Khi hủy order active → hoàn tồn kho cho items đang preparing
 */
const updateOrderStatus = async (id, newStatus) => {
  const validStatuses = ["active", "completed", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Trạng thái không hợp lệ. Được phép: ${validStatuses.join(", ")}`,
    );
  }

  const order = await OrderModel.findById(id);
  if (!order) return null;

  if (order.status === "completed" || order.status === "cancelled") {
    throw new Error(
      `Không thể thay đổi trạng thái khi order đã ${order.status}.`,
    );
  }

  // Duyệt đơn QR: pending → active: chuyển items + trừ kho
  if (newStatus === "active" && order.status === "pending") {
    await knex("order_items")
      .where({ order_id: id, status: "pending" })
      .update({ status: "preparing" });
    await deductInventoryForOrder(id);
  }

  // Hủy order active → hoàn tồn kho + cancel items đang preparing
  if (newStatus === "cancelled" && order.status === "active") {
    await restoreInventoryForOrder(id);
    await knex("order_items")
      .where({ order_id: id, status: "preparing" })
      .update({ status: "cancelled" });
  }

  // Hủy order pending → cancel tất cả items pending
  if (newStatus === "cancelled" && order.status === "pending") {
    await knex("order_items")
      .where({ order_id: id, status: "pending" })
      .update({ status: "cancelled" });
  }

  return OrderModel.update(id, { status: newStatus });
};

/**
 * Trừ tồn kho cho tất cả items trong order
 * Được gọi khi tạo order (từ staff hoặc sau khi duyệt QR)
 */
const deductInventoryForOrder = async (orderId) => {
  const items = await OrderItemModel.findByOrder(orderId);

  for (const item of items) {
    if (item.status === "cancelled") continue;

    // Lấy hệ số nhân nguyên liệu từ variant (nếu có)
    let multiplier = 1.0;
    if (item.variant_id) {
      const variant = await MenuItemVariantModel.findById(item.variant_id);
      if (variant)
        multiplier = parseFloat(variant.ingredient_multiplier) || 1.0;
    }

    const recipe = await MenuItemIngredientModel.findByMenuItemId(
      item.menu_item_id,
    );

    for (const ing of recipe) {
      const totalNeeded =
        parseFloat(ing.quantity_needed) * item.quantity * multiplier;

      const inv = await InventoryModel.findByIngredientId(ing.ingredient_id);
      if (!inv || parseFloat(inv.current_stock) < totalNeeded) {
        throw new Error(
          `Không đủ tồn kho nguyên liệu "${ing.ingredient_name}" ` +
            `(cần ${totalNeeded} ${ing.unit}, còn ${inv ? inv.current_stock : 0} ${ing.unit}).`,
        );
      }

      await InventoryModel.deductStock(ing.ingredient_id, totalNeeded);
    }
  }
};

/**
 * Hoàn tồn kho khi hủy order — chỉ hoàn cho items đang preparing
 */
const restoreInventoryForOrder = async (orderId) => {
  const items = await OrderItemModel.findByOrder(orderId);

  for (const item of items) {
    if (item.status !== "preparing") continue;

    // Lấy hệ số nhân từ variant
    let multiplier = 1.0;
    if (item.variant_id) {
      const variant = await MenuItemVariantModel.findById(item.variant_id);
      if (variant)
        multiplier = parseFloat(variant.ingredient_multiplier) || 1.0;
    }

    const recipe = await MenuItemIngredientModel.findByMenuItemId(
      item.menu_item_id,
    );

    for (const ing of recipe) {
      const totalRestore =
        parseFloat(ing.quantity_needed) * item.quantity * multiplier;
      await InventoryModel.addStock(ing.ingredient_id, totalRestore);
    }
  }
};

export const orderService = {
  getAllOrders,
  getOrderHistory,
  getOrderById,
  updateOrderStatus,
  deductInventoryForOrder,
  restoreInventoryForOrder,
};
