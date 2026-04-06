/**
 * Tạo bảng service_requests — Yêu cầu hỗ trợ từ khách hàng
 *
 * request_type: loại yêu cầu (call_waiter, request_bill, need_help, ...)
 * status:       pending → acknowledged → resolved
 * staff_id:     nhân viên nhận xử lý (gán khi acknowledge)
 */
export const up = async (knex) => {
  await knex.schema.createTable("service_requests", (t) => {
    t.uuid("id").primary();

    t.uuid("table_id")
      .notNullable()
      .references("id")
      .inTable("tables")
      .onDelete("CASCADE");

    // Phiên ăn hiện tại (nullable — request có thể không gắn session)
    t.uuid("session_id").references("id").inTable("sessions").nullable();

    // Loại yêu cầu
    t.string("request_type").notNullable().defaultTo("call_waiter");

    // Trạng thái xử lý
    t.string("status").notNullable().defaultTo("pending");
    // pending → acknowledged → resolved

    // Nhân viên nhận xử lý
    t.uuid("staff_id").references("id").inTable("users").nullable();

    // Ghi chú từ khách
    t.text("note").nullable();

    // Thời gian nhận xử lý & hoàn tất
    t.timestamp("acknowledged_at").nullable();
    t.timestamp("resolved_at").nullable();

    t.timestamps(true, true); // created_at, updated_at
  });

  // Index cho query thường dùng: lấy request pending theo bàn
  await knex.schema.raw(
    "CREATE INDEX idx_service_requests_status ON service_requests (status) WHERE status != 'resolved'",
  );
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists("service_requests");
};
