export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    // ID = auth.users.id (Supabase)
    table
      .uuid("id")
      .primary()
      .references("id")
      .inTable("auth.users")
      .onDelete("cascade");

    // Thông tin hiển thị
    table.string("full_name").notNullable();
    table.string("phone").unique().nullable();
    table.string("email").unique().nullable();

    // Phân quyền hệ thống
    table
      .enu("role", ["guest", "staff", "cashier", "admin"])
      .notNullable()
      .defaultTo("guest");

    // Trạng thái tài khoản
    table.enu("status", ["active", "inactive", "blocked"]).defaultTo("active");

    // Thông tin nhân viên
    table.string("employee_code").unique().nullable();
    table.date("joined_at").nullable();

    // Audit
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.timestamp("deleted_at").nullable();
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}
