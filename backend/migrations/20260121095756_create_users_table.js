export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();

    table.string("phone").unique().nullable();
    table.string("email").unique().nullable();

    table
      .enu("role", ["guest", "staff", "cashier", "admin"])
      .notNullable()
      .defaultTo("guest");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}
