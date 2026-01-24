exports.up = (knex) =>
  knex.schema.createTable("order_items", (t) => {
    t.uuid("id").primary();
    t.uuid("order_id").references("id").inTable("orders");
    t.uuid("menu_item_id").references("id").inTable("menu_items");
    t.integer("quantity").notNullable();
    t.decimal("price", 10, 2).notNullable();
  });

exports.down = (knex) => knex.schema.dropTableIfExists("order_items");
