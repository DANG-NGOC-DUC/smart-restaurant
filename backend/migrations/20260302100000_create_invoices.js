/**
 * Tạo bảng invoices – lưu hóa đơn thanh toán cho mỗi session.
 * Một session khi checkout sẽ sinh đúng 1 invoice.
 */
export const up = (knex) =>
  knex.schema.createTable("invoices", (t) => {
    t.uuid("id").primary();
    t.uuid("session_id").references("id").inTable("sessions").notNullable();
    t.decimal("total_amount", 12, 2).notNullable().defaultTo(0);
    t.string("payment_method").notNullable().defaultTo("cash"); // cash | transfer | momo | bank
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

export const down = (knex) => knex.schema.dropTableIfExists("invoices");
