/**
 * Migration: Đơn giản hóa trạng thái đơn hàng
 *
 * orders.status:
 *   - pending: GIỮ NGUYÊN (đơn QR chờ duyệt)
 *   - confirmed/approved/preparing/served → active
 *   - completed/cancelled: giữ nguyên
 *
 * order_items.status:
 *   - pending: GIỮ NGUYÊN (items thuộc đơn QR chờ duyệt)
 *   - processing/ready → preparing
 *   - served/cancelled: giữ nguyên
 *
 * Luồng mới:
 *  1. NV tạo order → order=active, items=preparing, trừ kho ngay
 *  2. Khách QR → order=pending → NV/Thu ngân duyệt → active + preparing + trừ kho
 *  3. Bếp nấu xong → bấm chuông vật lý (không thao tác hệ thống)
 *  4. Phục vụ bưng lên → tích "Đã lên món" → item=served
 *  5. Thanh toán → order=completed
 */
export const up = async (knex) => {
  // ── 1. Chuyển order_items statuses ──────────────────────────
  // processing, ready → preparing (đang nấu)
  // GIỮA NGUYÊN pending (thuộc đơn QR chưa duyệt)
  await knex("order_items")
    .whereIn("status", ["processing", "ready"])
    .update({ status: "preparing" });

  // served và cancelled giữ nguyên

  // ── 2. Chuyển orders statuses ──────────────────────────────
  // confirmed, approved, preparing, served → active
  // GIỮ NGUYÊN pending (đơn QR chờ duyệt)
  await knex("orders")
    .whereIn("status", ["confirmed", "approved", "preparing", "served"])
    .update({ status: "active" });

  // completed và cancelled giữ nguyên

  // ── 3. Đổi default value ──────────────────────────────────
  // Default cho order vẫn là 'active' (NV tạo trực tiếp)
  // QR orders sẽ được tạo với status='pending' bởi code
  await knex.schema.alterTable("orders", (t) => {
    t.string("status").defaultTo("active").alter();
  });

  await knex.schema.alterTable("order_items", (t) => {
    t.string("status").defaultTo("preparing").alter();
  });
};

export const down = async (knex) => {
  // Rollback: đổi default về giá trị cũ
  await knex.schema.alterTable("orders", (t) => {
    t.string("status").defaultTo("pending").alter();
  });

  await knex.schema.alterTable("order_items", (t) => {
    t.string("status").defaultTo("pending").alter();
  });

  // Chuyển active → pending (best effort rollback)
  await knex("orders").where("status", "active").update({ status: "pending" });

  await knex("order_items")
    .where("status", "preparing")
    .update({ status: "pending" });
};
