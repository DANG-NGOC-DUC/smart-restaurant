/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("permissions", (table) => {
    table.increments("id").primary();
    table.string("key").notNullable().unique();
    table.string("label").notNullable();
    table.string("description").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("permissions");
}
