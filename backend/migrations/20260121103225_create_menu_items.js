exports.up = (knex) =>
  knex.schema.createTable("menu_items", (t) => {
    t.uuid("id").primary();
    t.string("name").notNullable();
    t.decimal("price", 10, 2).notNullable();
    t.uuid("category_id")
      .references("id")
      .inTable("menu_categories")
      .onDelete("SET NULL");
    t.boolean("is_available").defaultTo(true);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("menu_items");
