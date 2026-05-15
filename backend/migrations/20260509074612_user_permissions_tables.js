/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("user_permissions", function (table) {
    // user_id (uuid, FK -> users.id)
    table.uuid("user_id").notNullable();
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("permission_id").unsigned().notNullable();
    table
      .foreign("permission_id")
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE"); // Xóa bản ghi này nếu permission bị xóa

    // granted_by (uuid, FK -> users.id, nullable)
    table.uuid("granted_by").nullable();
    table
      .foreign("granted_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL"); // Nếu người cấp quyền bị xóa, giữ lại quyền này nhưng để trống người cấp

    // unique (user_id, permission_id) - Đảm bảo 1 user không bị gán trùng 1 quyền nhiều lần
    table.unique(["user_id", "permission_id"]);

    // index (user_id) - Tối ưu truy vấn khi lấy danh sách quyền của một user cụ thể
    table.index("user_id");

    // created_at (timestamp, default now)
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("user_permissions");
}
