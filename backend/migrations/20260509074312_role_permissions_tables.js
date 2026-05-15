/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("role_permissions", function (table) {
    table.enum("role", ["staff"]).notNullable();
    table.integer("permission_id").unsigned().notNullable();
    table
      .foreign("permission_id")
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE");
    table.unique(["role", "permission_id"]);
    table.index("role");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("role_permissions");
}
