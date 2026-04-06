import knex from "../../db/knex.js";
import crypto from "crypto";
import { orderService } from "../admin/order.service.js";

// ═══════════════════════════════════════════════════════════════════
// DATA-LOADING: Lấy danh sách bàn + chi tiết đơn hàng cho thu ngân
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/cashier/tables
 * Trả về danh sách bàn kèm trạng thái phục vụ cho thu ngân.
 *
 * Trạng thái bàn (status) được suy ra:
 *  - "empty"    : không có session open
 *  - "serving"  : có session open
 *  - "payment"  : có service_request request_bill chưa resolve
 */
const getTables = async () => {
  const rows = await knex("tables as t")
    .leftJoin("sessions as s", function () {
      this.on("s.table_id", "=", "t.id").andOn(
        "s.status",
        "=",
        knex.raw("'open'"),
      );
    })
    .leftJoin("orders as o", "o.session_id", "s.id")
    .leftJoin("order_items as oi", function () {
      this.on("oi.order_id", "=", "o.id").andOnNotIn("oi.status", [
        "cancelled",
      ]);
    })
    .select(
      "t.id",
      "t.code",
      "t.name",
      "t.capacity",
      "t.is_active",
      "s.id as session_id",
      "s.started_at as session_started_at",
    )
    .select(
      knex.raw(
        "COALESCE(SUM(oi.price * oi.quantity), 0)::numeric as total_amount",
      ),
    )
    .select(
      knex.raw(
        "COUNT(DISTINCT CASE WHEN oi.status != 'cancelled' THEN oi.id END)::int as total_items",
      ),
    )
    .select(
      knex.raw(
        "COUNT(DISTINCT CASE WHEN oi.status = 'preparing' THEN oi.id END)::int as preparing_items_count",
      ),
    )
    .select(
      knex.raw(
        "COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END)::int as pending_orders_count",
      ),
    )
    .where("t.is_active", true)
    .groupBy("t.id", "s.id")
    .orderBy("t.name", "asc");

  // Lấy service_requests loại 'request_bill' chưa resolve
  const sessionIds = rows.filter((r) => r.session_id).map((r) => r.session_id);
  let paymentRequests = [];
  if (sessionIds.length > 0) {
    paymentRequests = await knex("service_requests")
      .whereIn("session_id", sessionIds)
      .where("request_type", "request_bill")
      .whereNot("status", "resolved")
      .select("session_id", "created_at");
  }
  const paymentMap = {};
  for (const req of paymentRequests) {
    paymentMap[req.session_id] = req.created_at;
  }

  return rows.map((row) => {
    let status = "empty";
    if (row.session_id) {
      if (paymentMap[row.session_id]) {
        status = "payment";
      } else {
        status = "serving";
      }
    }

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      capacity: row.capacity,
      status,
      session_id: row.session_id || null,
      session_started_at: row.session_started_at || null,
      total_amount: parseFloat(row.total_amount) || 0,
      total_items: parseInt(row.total_items) || 0,
      preparing_items_count: parseInt(row.preparing_items_count) || 0,
      pending_orders_count: parseInt(row.pending_orders_count) || 0,
      payment_requested_at: paymentMap[row.session_id] || null,
    };
  });
};

/**
 * GET /api/cashier/tables/:tableId/orders
 * Trả về chi tiết đơn hàng của phiên đang mở tại bàn.
 * Bao gồm danh sách orders + order_items kèm tên món.
 */
const getTableOrders = async (tableId) => {
  // Tìm session đang mở
  const session = await knex("sessions")
    .where({ table_id: tableId, status: "open" })
    .first();

  if (!session) {
    return { session: null, orders: [] };
  }

  // Lấy tất cả orders của session
  const orders = await knex("orders")
    .where({ session_id: session.id })
    .orderBy("created_at", "asc");

  if (orders.length === 0) {
    return { session, orders: [] };
  }

  // Lấy tất cả order_items + tên món
  const orderIds = orders.map((o) => o.id);
  const items = await knex("order_items as oi")
    .join("menu_items as mi", "mi.id", "oi.menu_item_id")
    .whereIn("oi.order_id", orderIds)
    .select(
      "oi.id",
      "oi.order_id",
      "oi.menu_item_id",
      "oi.quantity",
      "oi.price",
      "oi.note",
      "oi.status",
      "oi.variant_label",
      "oi.created_at",
      "mi.name as menu_item_name",
      "mi.image_url",
    )
    .orderBy("oi.created_at", "asc");

  // Gom items theo order_id
  const itemsByOrder = {};
  for (const item of items) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  }

  return {
    session,
    orders: orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    })),
  };
};

// ═══════════════════════════════════════════════════════════════════
// 1. DUYỆT ĐƠN QR CỦA KHÁCH
//    PATCH /api/cashier/orders/:orderId/approve
// ═══════════════════════════════════════════════════════════════════

/**
 * Duyệt đơn hàng QR từ khách:
 *  - orders.status: 'pending' → 'active'
 *  - order_items.status: 'pending' → 'preparing' (bếp bắt đầu làm)
 *  - Trừ tồn kho ngay
 *
 * @param {string} orderId - UUID của đơn hàng cần duyệt
 * @returns {object} order đã được duyệt
 */
const approveOrder = async (orderId) => {
  return knex.transaction(async (trx) => {
    const [order] = await trx("orders")
      .where({ id: orderId, status: "pending" })
      .update({ status: "active" })
      .returning("*");

    if (!order) {
      const existing = await trx("orders").where({ id: orderId }).first();
      if (!existing) {
        throw new Error("Đơn hàng không tồn tại.");
      }
      if (existing.status === "active") {
        throw new Error("Đơn hàng đã được duyệt rồi.");
      }
      throw new Error(
        `Không thể duyệt đơn hàng. Trạng thái hiện tại: '${existing.status}'.`,
      );
    }

    // Chuyển tất cả items pending → preparing (bếp bắt đầu nấu)
    const updatedItems = await trx("order_items")
      .where({ order_id: orderId, status: "pending" })
      .update({ status: "preparing" })
      .returning("*");

    // Trừ tồn kho ngay khi duyệt
    await orderService.deductInventoryForOrder(orderId);

    return { ...order, items: updatedItems };
  });
};

// ═══════════════════════════════════════════════════════════════════
// 2. HỦY MÓN NGOẠI LỆ
//    PATCH /api/cashier/order-items/:itemId/cancel
// ═══════════════════════════════════════════════════════════════════

/**
 * Hủy một món trong đơn hàng:
 *  - order_items.status → 'cancelled'
 *  - Chỉ hủy được khi status = 'preparing' (chưa lên bàn)
 *
 * @param {string} itemId - UUID của order_item cần hủy
 * @returns {object} order_item đã được hủy
 */
const cancelOrderItem = async (itemId) => {
  const item = await knex("order_items").where({ id: itemId }).first();

  if (!item) {
    throw new Error("Món không tồn tại.");
  }

  if (item.status === "served") {
    throw new Error(
      "Không thể hủy món đã phục vụ. Liên hệ quản lý nếu cần xử lý.",
    );
  }

  if (item.status === "cancelled") {
    throw new Error("Món này đã được hủy trước đó.");
  }

  if (item.status !== "preparing") {
    throw new Error(
      `Không thể hủy món. Trạng thái hiện tại: '${item.status}'.`,
    );
  }

  const [updatedItem] = await knex("order_items")
    .where({ id: itemId, status: "preparing" })
    .update({ status: "cancelled" })
    .returning("*");

  if (!updatedItem) {
    throw new Error("Món đã được cập nhật bởi người khác. Vui lòng thử lại.");
  }

  return updatedItem;
};

// ═══════════════════════════════════════════════════════════════════
// 3. THANH TOÁN & ĐÓNG PHIÊN BÀN
//    POST /api/cashier/tables/:tableId/checkout
// ═══════════════════════════════════════════════════════════════════

/**
 * Thanh toán cho bàn và đóng phiên:
 *  - Kiểm tra còn món đang nấu (processing) → block
 *  - Tính tổng tiền các món đã phục vụ (served)
 *  - Tạo invoice
 *  - Đóng session (status → 'closed', ghi ended_at)
 *  - Bàn tự động trở thành 'empty' vì không còn session mở
 *
 * BẮT BUỘC sử dụng knex.transaction() để đảm bảo toàn vẹn dữ liệu.
 *
 * @param {string} tableId - UUID của bàn cần thanh toán
 * @param {string} paymentMethod - Phương thức thanh toán (cash|transfer|momo|bank)
 * @returns {object} thông tin invoice
 */
const checkout = async (tableId, paymentMethod = "cash") => {
  return knex.transaction(async (trx) => {
    // ── Bước a: Tìm bàn và session đang mở ──────────────────────
    const table = await trx("tables").where({ id: tableId }).first();
    if (!table) {
      throw new Error("Bàn không tồn tại.");
    }

    const session = await trx("sessions")
      .where({ table_id: tableId, status: "open" })
      .first();

    if (!session) {
      throw new Error("Bàn này hiện không có phiên nào đang mở.");
    }

    // ── Bước b: Chốt chặn – kiểm tra món đang nấu ──────────────
    const preparingItems = await trx("order_items as oi")
      .join("orders as o", "o.id", "oi.order_id")
      .where("o.session_id", session.id)
      .where("oi.status", "preparing")
      .select("oi.id");

    if (preparingItems.length > 0) {
      throw new Error(
        "Vẫn còn món đang nấu chưa phục vụ, vui lòng kiểm tra lại.",
      );
    }

    // ── Bước c: Tính tổng tiền các món đã phục vụ (served) ──────
    const [{ total }] = await trx("order_items as oi")
      .join("orders as o", "o.id", "oi.order_id")
      .where("o.session_id", session.id)
      .where("oi.status", "served")
      .sum({ total: trx.raw("oi.price * oi.quantity") });

    const totalAmount = parseFloat(total) || 0;

    // ── Bước d: Tạo bản ghi invoice ─────────────────────────────
    const [invoice] = await trx("invoices")
      .insert({
        id: crypto.randomUUID(),
        session_id: session.id,
        total_amount: totalAmount,
        payment_method: paymentMethod,
      })
      .returning("*");

    // ── Bước e: Đánh dấu tất cả orders active → completed ───────
    await trx("orders")
      .where({ session_id: session.id, status: "active" })
      .update({ status: "completed" });

    // ── Bước f: Đóng session ─────────────────────────────────────
    await trx("sessions").where({ id: session.id }).update({
      status: "closed",
      ended_at: trx.fn.now(),
    });

    // ── Bước f: Giải phóng bàn ──────────────────────────────────
    // Trong schema hiện tại, trạng thái bàn được suy ra từ sessions.
    // Khi session đã closed, bàn tự động "empty" khi query.
    // Không cần update trực tiếp trên bảng tables.

    // ── Bước g: Trả về thông tin invoice ─────────────────────────
    return {
      invoice,
      session_id: session.id,
      table_id: tableId,
      table_name: table.name || `Bàn ${table.code}`,
    };
  });
};

// ═══════════════════════════════════════════════════════════════════
// 4. YÊU CẦU HỖ TRỢ TỪ KHÁCH (SERVICE REQUESTS)
// ═══════════════════════════════════════════════════════════════════

const getServiceRequests = async () => {
  const rows = await knex("service_requests as sr")
    .join("tables as t", "t.id", "sr.table_id")
    .leftJoin("sessions as s", "s.id", "sr.session_id")
    .whereIn("sr.status", ["pending", "acknowledged"])
    .select(
      "sr.id",
      "sr.table_id",
      "sr.session_id",
      "sr.request_type",
      "sr.status",
      "sr.created_at",
      "t.name as table_name",
      "t.code as table_code",
    )
    .orderBy("sr.created_at", "asc");

  return rows;
};

const resolveServiceRequest = async (requestId) => {
  const [updated] = await knex("service_requests")
    .where({ id: requestId })
    .whereIn("status", ["pending", "acknowledged"])
    .update({ status: "resolved", updated_at: knex.fn.now() })
    .returning("*");

  if (!updated) {
    throw new Error("Yêu cầu không tồn tại hoặc đã được xử lý.");
  }

  return updated;
};

// ═══════════════════════════════════════════════════════════════════
// ĐẶT BÀN TRƯỚC
// ═══════════════════════════════════════════════════════════════════

const getReservations = async (status) => {
  let query = knex("reservations")
    .leftJoin("users", "reservations.user_id", "users.id")
    .leftJoin("tables", "reservations.table_id", "tables.id")
    .select(
      "reservations.*",
      "users.full_name as customer_name",
      "users.email as customer_email",
      "users.phone as customer_phone",
      "tables.name as table_name",
      "tables.code as table_code",
    )
    .orderBy("reservations.reserved_at", "asc");

  if (status) {
    query = query.where("reservations.status", status);
  } else {
    query = query.whereIn("reservations.status", ["pending", "confirmed"]);
  }

  return query;
};

const confirmReservation = async (id, tableId) => {
  const reservation = await knex("reservations").where({ id }).first();
  if (!reservation) throw new Error("Đặt bàn không tồn tại.");
  if (reservation.status !== "pending") {
    throw new Error("Chỉ có thể xác nhận đặt bàn đang chờ.");
  }

  const updateData = { status: "confirmed" };
  if (tableId) updateData.table_id = tableId;

  const [updated] = await knex("reservations")
    .where({ id })
    .update(updateData)
    .returning("*");
  return updated;
};

const rejectReservation = async (id) => {
  const reservation = await knex("reservations").where({ id }).first();
  if (!reservation) throw new Error("Đặt bàn không tồn tại.");
  if (reservation.status !== "pending") {
    throw new Error("Chỉ có thể từ chối đặt bàn đang chờ.");
  }

  const [updated] = await knex("reservations")
    .where({ id })
    .update({ status: "cancelled" })
    .returning("*");
  return updated;
};

export const cashierService = {
  getTables,
  getTableOrders,
  approveOrder,
  cancelOrderItem,
  checkout,
  getServiceRequests,
  resolveServiceRequest,
  getReservations,
  confirmReservation,
  rejectReservation,
};
