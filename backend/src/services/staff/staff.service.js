import knex from "../../db/knex.js";
import crypto from "crypto";
import { orderService } from "../admin/order.service.js";

/**
 * GET /api/staff/menu
 * Trả về danh mục + món đang còn phục vụ (is_available = true).
 * Dùng cho nhân viên đặt món hộ khách.
 */
const getMenuForStaff = async () => {
  const categories = await knex("menu_categories")
    .select("id", "name")
    .orderBy("id", "asc");

  const items = await knex("menu_items")
    .where({ is_available: true })
    .select("id", "name", "price", "category_id", "image_url", "description")
    .orderBy("name", "asc");

  return { categories, items };
};

/**
 * GET /api/staff/tables/:tableId
 * Trả về chi tiết bàn: thông tin bàn, session, danh sách orders + items.
 * NV dùng để xem món đã đặt, trạng thái từng món, tổng tiền.
 */
const getTableDetail = async (tableId) => {
  const table = await knex("tables").where({ id: tableId }).first();
  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  const session = await knex("sessions")
    .where({ table_id: tableId, status: "open" })
    .first();

  if (!session) {
    return {
      ...table,
      table_name: table.name || `Bàn ${table.code}`,
      status: "empty",
      session: null,
      orders: [],
      total_amount: 0,
    };
  }

  // Lấy tất cả orders của session này
  const orders = await knex("orders")
    .where({ session_id: session.id })
    .whereNot({ status: "cancelled" })
    .orderBy("created_at", "asc");

  // Lấy tất cả order_items
  const orderIds = orders.map((o) => o.id);
  let items = [];
  if (orderIds.length > 0) {
    items = await knex("order_items as oi")
      .join("menu_items as mi", "mi.id", "oi.menu_item_id")
      .whereIn("oi.order_id", orderIds)
      .select(
        "oi.id",
        "oi.order_id",
        "oi.quantity",
        "oi.price",
        "oi.status",
        "oi.note",
        "oi.cancel_reason",
        "oi.created_at",
        "mi.name as menu_item_name",
        "mi.image_url",
      )
      .orderBy("oi.created_at", "asc");
  }

  // Gom items theo order
  const itemsByOrder = {};
  for (const item of items) {
    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
    itemsByOrder[item.order_id].push(item);
  }

  // Tính tổng tiền (trừ cancelled)
  const totalAmount = items
    .filter((i) => i.status !== "cancelled")
    .reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return {
    ...table,
    table_name: table.name || `Bàn ${table.code}`,
    status: "occupied",
    session: {
      id: session.id,
      started_at: session.started_at,
      user_id: session.user_id,
    },
    orders: orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    })),
    total_amount: totalAmount,
  };
};

/**
 * GET /api/staff/tables
 * Trả về danh sách tất cả bàn kèm trạng thái session + tổng tiền.
 *
 * Trạng thái bàn:
 *  - "empty"    : không có session đang mở
 *  - "occupied" : có session đang mở (status = 'open')
 *  - "dirty"    : session đã chuyển sang 'dirty' (chờ dọn)
 */
const getTablesForStaff = async () => {
  const rows = await knex("tables as t")
    .leftJoin("sessions as s", function () {
      this.on("s.table_id", "=", "t.id").andOn(
        "s.status",
        "=",
        knex.raw("'open'"),
      );
    })
    .leftJoin("orders as o", function () {
      this.on("o.session_id", "=", "s.id");
    })
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
      "s.user_id as session_user_id",
    )
    .select(
      knex.raw(
        "COALESCE(SUM(oi.price * oi.quantity), 0)::numeric as total_amount",
      ),
    )
    .groupBy("t.id", "s.id")
    .orderBy("t.name", "asc");

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    capacity: row.capacity,
    is_active: row.is_active,
    status: row.session_id ? "occupied" : "empty",
    session_id: row.session_id || null,
    session_started_at: row.session_started_at || null,
    session_user_id: row.session_user_id || null,
    total_amount: parseFloat(row.total_amount) || 0,
  }));
};

// ═══════════════════════════════════════════════════════════════════
// DUYỆT ĐƠN HÀNG QR TỪ KHÁCH (orders.status = 'pending')
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/staff/pending-orders
 * Trả về danh sách đơn hàng chờ duyệt (orders.status = 'pending').
 * Kèm thông tin bàn + danh sách món.
 */
const getPendingOrders = async () => {
  const orders = await knex("orders as o")
    .join("sessions as s", "s.id", "o.session_id")
    .join("tables as t", "t.id", "s.table_id")
    .where("o.status", "pending")
    .select(
      "o.id",
      "o.session_id",
      "o.total_price",
      "o.status",
      "o.created_at",
      "t.id as table_id",
      "t.name as table_name",
      "t.code as table_code",
    )
    .orderBy("o.created_at", "asc");

  if (orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);
  const items = await knex("order_items as oi")
    .join("menu_items as mi", "mi.id", "oi.menu_item_id")
    .whereIn("oi.order_id", orderIds)
    .select(
      "oi.id",
      "oi.order_id",
      "oi.quantity",
      "oi.price",
      "oi.note",
      "oi.status",
      "mi.name as menu_item_name",
    );

  const itemsByOrder = {};
  for (const item of items) {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = [];
    }
    itemsByOrder[item.order_id].push(item);
  }

  return orders.map((order) => ({
    ...order,
    table_name: order.table_name || `Bàn ${order.table_code}`,
    items: itemsByOrder[order.id] || [],
  }));
};

/**
 * PATCH /api/staff/orders/:orderId/approve
 * Duyệt đơn hàng QR từ khách:
 *  - orders.status: 'pending' → 'active'
 *  - order_items.status: 'pending' → 'preparing'
 *  - Trừ tồn kho ngay khi duyệt
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
      throw new Error(`Không thể duyệt. Trạng thái: '${existing.status}'.`);
    }

    // Chuyển items pending → preparing (bếp bắt đầu nấu)
    await trx("order_items")
      .where({ order_id: orderId, status: "pending" })
      .update({ status: "preparing" });

    // Trừ tồn kho ngay khi duyệt
    await orderService.deductInventoryForOrder(orderId, trx);

    return order;
  });
};

/**
 * PATCH /api/staff/orders/:orderId/cancel
 * Hủy đơn hàng QR đang chờ xác nhận (pending).
 */
const cancelPendingOrder = async (orderId) => {
  const order = await knex("orders").where({ id: orderId }).first();

  if (!order) {
    throw new Error("Đơn hàng không tồn tại.");
  }

  if (order.status !== "pending") {
    throw new Error(
      `Chỉ có thể hủy đơn đang chờ xác nhận. Trạng thái hiện tại: '${order.status}'.`,
    );
  }

  return orderService.updateOrderStatus(orderId, "cancelled");
};

/**
 * GET /api/staff/pending-items
 * Trả về danh sách order_items có status = 'cooked' (chờ mang ra bàn).
 * NV bưng đồ → bấm "Đã lên" trên app.
 * Sắp xếp theo created_at ASC (món cũ nhất lên đầu).
 */
const getPendingItems = async () => {
  const rows = await knex("order_items as oi")
    .join("orders as o", "o.id", "oi.order_id")
    .join("sessions as s", "s.id", "o.session_id")
    .join("tables as t", "t.id", "s.table_id")
    .join("menu_items as mi", "mi.id", "oi.menu_item_id")
    .whereIn("oi.status", ["cooked"])
    .select(
      "oi.id",
      "oi.quantity",
      "oi.note",
      "oi.status",
      "oi.created_at",
      "mi.name as menu_item_name",
      "mi.image_url",
      "t.name as table_name",
      "t.code as table_code",
      "o.id as order_id",
    )
    .select(
      knex.raw(
        "EXTRACT(EPOCH FROM (NOW() - oi.created_at)) / 60 as waiting_minutes",
      ),
    )
    .orderBy("oi.created_at", "asc");

  return rows.map((row) => ({
    id: row.id,
    menu_item_name: row.menu_item_name,
    image_url: row.image_url,
    quantity: row.quantity,
    note: row.note,
    status: row.status,
    table_name: row.table_name || `Bàn ${row.table_code}`,
    table_code: row.table_code,
    order_id: row.order_id,
    created_at: row.created_at,
    waiting_minutes: Math.round(parseFloat(row.waiting_minutes) || 0),
  }));
};

/**
 * Staff hủy món khi khách yêu cầu (chưa lên).
 * Chỉ cho phép hủy khi status = 'preparing' hoặc 'cooked'.
 * Atomic WHERE để chống race condition.
 *
 * @param {string} itemId - UUID order_item
 * @returns {Object} updated order_item
 */
const cancelItem = async (itemId, reason, staffId = null) => {
  if (!reason || !reason.trim()) {
    throw new Error("Vui lòng chọn lý do hủy món.");
  }

  const item = await knex("order_items").where({ id: itemId }).first();
  if (!item) {
    throw new Error("Không tìm thấy món.");
  }
  if (item.status !== "preparing" && item.status !== "cooked") {
    throw new Error(
      `Không thể hủy món. Trạng thái hiện tại: '${item.status}'. Chỉ hủy được món đang nấu hoặc đã nấu xong.`,
    );
  }

  const [updated] = await knex("order_items")
    .where({ id: itemId })
    .whereIn("status", ["preparing", "cooked"])
    .update({
      status: "cancelled",
      cancel_reason: reason.trim(),
      cancelled_by: staffId,
      cancelled_at: knex.fn.now(),
    })
    .returning("*");

  if (!updated) {
    throw new Error("Món đã được cập nhật bởi người khác. Vui lòng thử lại.");
  }

  return updated;
};

/**
 * Bếp xác nhận đã chế biến xong (preparing → cooked)
 */
const markItemCooked = async (itemId) => {
  const item = await knex("order_items").where({ id: itemId }).first();
  if (!item) {
    throw new Error("Không tìm thấy món.");
  }
  if (item.status !== "preparing") {
    throw new Error(
      `Không thể xác nhận. Trạng thái hiện tại: '${item.status}'. Chỉ xác nhận được món đang nấu.`,
    );
  }

  const [updated] = await knex("order_items")
    .where({ id: itemId, status: "preparing" })
    .update({ status: "cooked" })
    .returning("*");

  if (!updated) {
    throw new Error("Món đã được cập nhật bởi người khác. Vui lòng thử lại.");
  }

  return updated;
};

/**
 * Nhân viên xác nhận đã lên món (cooked → served)
 */
const markItemServed = async (itemId) => {
  const item = await knex("order_items").where({ id: itemId }).first();
  if (!item) {
    throw new Error("Không tìm thấy món.");
  }
  if (item.status !== "cooked") {
    throw new Error(
      `Không thể lên món. Trạng thái hiện tại: '${item.status}'. Chỉ lên được món đã chế biến xong.`,
    );
  }

  const [updated] = await knex("order_items")
    .where({ id: itemId })
    .whereIn("status", ["cooked"])
    .update({ status: "served" })
    .returning("*");

  if (!updated) {
    throw new Error("Món đã được cập nhật bởi người khác. Vui lòng thử lại.");
  }

  return updated;
};

/**
 * POST /api/staff/orders
 * Nhân viên đặt món hộ khách.
 *
 * Luồng xử lý (trong 1 Knex transaction — auto-rollback nếu fail):
 *  1. Validate input (tableId + items)
 *  2. Lấy thông tin bàn → kiểm tra tồn tại & is_active
 *  3. Xử lý session:
 *     - Bàn empty (không có session status='open') → tạo session mới
 *     - Bàn occupied (có session status='open')   → dùng session hiện tại
 *  4. Lấy giá menu_items trong 1 query duy nhất → validate
 *  5. Tạo order (status='confirmed') — nhân viên order thì bỏ bước duyệt
 *  6. Bulk insert order_items (status='processing') — bếp làm luôn
 *  7. Cập nhật total_price trên order
 *
 * @param {string}  tableId  - UUID của bàn
 * @param {Array<{itemId: string, quantity: number, note?: string}>} items
 * @param {string|null} staffId - UUID nhân viên (từ req.user)
 * @returns {Object} { session, order, orderItems }
 */
const createOrderForTable = async (tableId, items, staffId = null) => {
  // ── 1. Validate input ──────────────────────────────────────
  if (!tableId) {
    throw new Error("tableId là bắt buộc.");
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách món (items) không được rỗng.");
  }

  // Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
  // Nếu bất kỳ bước nào throw error → toàn bộ ROLLBACK tự động
  return knex.transaction(async (trx) => {
    // ── 2. Lấy thông tin bàn (FOR UPDATE → lock row) ──────────
    // FOR UPDATE: khóa row bàn này trong transaction
    // → NV khác cùng order cho bàn này phải chờ transaction kết thúc
    // → Tránh race condition tạo 2 session cho 1 bàn trống
    const table = await trx("tables")
      .where({ id: tableId })
      .forUpdate()
      .first();
    if (!table) {
      throw new Error("Bàn không tồn tại.");
    }
    if (!table.is_active) {
      throw new Error("Bàn đang không hoạt động.");
    }

    // ── 3. Xử lý session ──────────────────────────────────────
    // Tìm session đang mở (status = 'open') của bàn này
    let session = await trx("sessions")
      .where({ table_id: tableId, status: "open" })
      .first();

    if (!session) {
      // Bàn empty → tạo session mới
      const [newSession] = await trx("sessions")
        .insert({
          id: crypto.randomUUID(),
          table_id: tableId,
          user_id: staffId,
          status: "open",
          started_at: trx.fn.now(),
        })
        .returning("*");
      session = newSession;
    }
    // Nếu session tồn tại & status === 'open' → dùng luôn session hiện tại

    // ── 4. Lấy giá menu_items (1 query duy nhất) ─────────────
    const menuItemIds = items.map((i) => i.itemId);
    const menuItems = await trx("menu_items")
      .whereIn("id", menuItemIds)
      .select("id", "name", "price", "is_available");

    // Tạo map để lookup nhanh O(1)
    const menuMap = new Map(menuItems.map((mi) => [mi.id, mi]));

    // Validate từng item: tồn tại + đang bán + quantity >= 1
    for (const item of items) {
      const mi = menuMap.get(item.itemId);
      if (!mi) {
        throw new Error(`Món '${item.itemId}' không tồn tại.`);
      }
      if (!mi.is_available) {
        throw new Error(`Món '${mi.name}' hiện không còn phục vụ.`);
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`Số lượng món '${mi.name}' phải >= 1.`);
      }
    }

    // ── 5. Tạo order ──────────────────────────────────────────
    // status = 'active' → gửi thẳng xuống bếp
    const orderId = crypto.randomUUID();
    const [order] = await trx("orders")
      .insert({
        id: orderId,
        session_id: session.id,
        status: "active",
        total_price: 0, // tạm, cập nhật ở bước 7
      })
      .returning("*");

    // ── 6. Bulk insert order_items ─────────────────────────────
    // status = 'preparing' → bếp nhận & nấu luôn
    const orderItemRows = items.map((item) => {
      const mi = menuMap.get(item.itemId);
      return {
        id: crypto.randomUUID(),
        order_id: orderId,
        menu_item_id: item.itemId,
        quantity: item.quantity,
        price: mi.price,
        note: item.note || null,
        status: "preparing",
      };
    });

    const orderItems = await trx("order_items")
      .insert(orderItemRows)
      .returning("*");

    // ── 7. Cập nhật total_price trên order ─────────────────────
    const totalPrice = orderItemRows.reduce(
      (sum, oi) => sum + parseFloat(oi.price) * oi.quantity,
      0,
    );

    await trx("orders")
      .where({ id: orderId })
      .update({ total_price: totalPrice });

    order.total_price = totalPrice;

    // ── 8. Trừ tồn kho ngay khi tạo order ─────────────────────
    await orderService.deductInventoryForOrder(orderId, trx);

    return { session, order, orderItems };
  });
};

// ═══════════════════════════════════════════════════════════════════
// YÊU CẦU THANH TOÁN (staff → cashier thông qua service_requests)
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/staff/requests
 * Nhân viên tạo yêu cầu thanh toán cho bàn.
 * Insert vào service_requests với request_type = 'request_bill'.
 * Cashier nhận thông qua Supabase Realtime.
 *
 * @param {string} tableId - UUID của bàn
 * @param {string} requestType - Loại yêu cầu (request_bill, call_waiter, ...)
 * @param {string|null} staffId - UUID nhân viên
 */
const createPaymentRequest = async (
  tableId,
  requestType = "request_bill",
  staffId = null,
) => {
  if (!tableId) {
    throw new Error("tableId là bắt buộc.");
  }

  // Kiểm tra bàn tồn tại
  const table = await knex("tables").where({ id: tableId }).first();
  if (!table) {
    throw new Error("Bàn không tồn tại.");
  }

  // Tìm session đang mở để gắn vào request
  const session = await knex("sessions")
    .where({ table_id: tableId, status: "open" })
    .first();

  if (!session) {
    throw new Error("Bàn chưa có phiên nào đang mở.");
  }

  // Kiểm tra trùng: đã có request_bill pending cho bàn này chưa?
  const existingRequest = await knex("service_requests")
    .where({
      table_id: tableId,
      session_id: session.id,
      request_type: requestType,
    })
    .whereIn("status", ["pending", "acknowledged"])
    .first();

  if (existingRequest) {
    throw new Error("Bàn này đã có yêu cầu thanh toán đang chờ xử lý.");
  }

  const [request] = await knex("service_requests")
    .insert({
      id: crypto.randomUUID(),
      table_id: tableId,
      session_id: session.id,
      request_type: requestType,
      status: "pending",
      staff_id: staffId,
      note: `Nhân viên yêu cầu thanh toán cho ${table.name || "Bàn " + table.code}`,
    })
    .returning("*");

  return request;
};

// ═══════════════════════════════════════════════════════════════════
// YÊU CẦU HỖ TRỢ TỪ KHÁCH HÀNG (service_requests)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/staff/requests
 * Lấy danh sách yêu cầu hỗ trợ chưa hoàn tất (pending + acknowledged).
 * Kèm thông tin bàn để nhân viên biết cần đến bàn nào.
 * Sắp xếp: pending trước, rồi theo created_at ASC (cũ nhất lên đầu).
 */
const getServiceRequests = async () => {
  const rows = await knex("service_requests as sr")
    .join("tables as t", "t.id", "sr.table_id")
    .leftJoin("users as u", "u.id", "sr.staff_id")
    .whereIn("sr.status", ["pending", "acknowledged"])
    .select(
      "sr.id",
      "sr.table_id",
      "sr.session_id",
      "sr.request_type",
      "sr.status",
      "sr.note",
      "sr.staff_id",
      "sr.acknowledged_at",
      "sr.created_at",
      "t.name as table_name",
      "t.code as table_code",
      "u.full_name as staff_name",
    )
    .select(
      knex.raw(
        "EXTRACT(EPOCH FROM (NOW() - sr.created_at)) / 60 as waiting_minutes",
      ),
    )
    .orderByRaw("CASE sr.status WHEN 'pending' THEN 0 ELSE 1 END ASC")
    .orderBy("sr.created_at", "asc");

  return rows.map((row) => ({
    ...row,
    table_name: row.table_name || `Bàn ${row.table_code}`,
    waiting_minutes: Math.round(parseFloat(row.waiting_minutes) || 0),
  }));
};

/**
 * PATCH /api/staff/requests/:requestId/acknowledge
 * Nhân viên nhận xử lý yêu cầu hỗ trợ.
 *
 * Đảm bảo tính toàn vẹn dữ liệu:
 *  - Chỉ cho acknowledge khi status = 'pending'
 *  - Dùng WHERE atomic: UPDATE ... WHERE id = ? AND status = 'pending'
 *    → Nếu 2 nhân viên bấm cùng lúc, chỉ 1 người thành công
 *    → Người còn lại nhận rows affected = 0 → báo lỗi
 *
 * @param {string} requestId - UUID của yêu cầu
 * @param {string} staffId   - UUID nhân viên đang thao tác
 */
const acknowledgeRequest = async (requestId, staffId) => {
  // Atomic update: WHERE kèm status = 'pending' → tránh race condition
  const updated = await knex("service_requests")
    .where({ id: requestId, status: "pending" })
    .update({
      status: "acknowledged",
      staff_id: staffId,
      acknowledged_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    })
    .returning("*");

  // Không có row nào bị update → request không tồn tại hoặc đã có người nhận
  if (!updated || updated.length === 0) {
    // Kiểm tra request có tồn tại không để trả lỗi chính xác
    const existing = await knex("service_requests")
      .where({ id: requestId })
      .first();

    if (!existing) {
      throw new Error("Yêu cầu hỗ trợ không tồn tại.");
    }
    if (existing.status === "acknowledged") {
      throw new Error("Yêu cầu này đã có nhân viên khác đang xử lý.");
    }
    if (existing.status === "resolved") {
      throw new Error("Yêu cầu này đã được giải quyết.");
    }
    throw new Error(
      `Không thể nhận yêu cầu. Trạng thái hiện tại: '${existing.status}'.`,
    );
  }

  return updated[0];
};

/**
 * PATCH /api/staff/requests/:requestId/resolve
 * Nhân viên đánh dấu đã hoàn tất xử lý yêu cầu.
 * Chỉ cho phép khi status = 'acknowledged' VÀ staff_id trùng khớp.
 *
 * @param {string} requestId
 * @param {string} staffId
 */
const resolveRequest = async (requestId, staffId) => {
  // Atomic update: chỉ người đã nhận mới được resolve
  const updated = await knex("service_requests")
    .where({ id: requestId, status: "acknowledged", staff_id: staffId })
    .update({
      status: "resolved",
      resolved_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    })
    .returning("*");

  if (!updated || updated.length === 0) {
    const existing = await knex("service_requests")
      .where({ id: requestId })
      .first();

    if (!existing) {
      throw new Error("Yêu cầu hỗ trợ không tồn tại.");
    }
    if (existing.status === "pending") {
      throw new Error("Yêu cầu chưa được nhận. Hãy nhận xử lý trước.");
    }
    if (existing.status === "resolved") {
      throw new Error("Yêu cầu này đã được giải quyết rồi.");
    }
    if (existing.staff_id !== staffId) {
      throw new Error("Bạn không phải người nhận xử lý yêu cầu này.");
    }
    throw new Error(`Không thể hoàn tất. Trạng thái: '${existing.status}'.`);
  }

  return updated[0];
};

export const staffService = {
  getTablesForStaff,
  getTableDetail,
  getMenuForStaff,
  getPendingOrders,
  approveOrder,
  cancelPendingOrder,
  getPendingItems,
  cancelItem,
  markItemCooked,
  markItemServed,
  createOrderForTable,
  createPaymentRequest,
  acknowledgeRequest,
  resolveRequest,
  getServiceRequests,
};
