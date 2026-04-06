export const up = (knex) =>
  knex.schema.createTable("menu_item_variants", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.uuid("menu_item_id")
      .notNullable()
      .references("id")
      .inTable("menu_items")
      .onDelete("CASCADE");
    t.string("label").notNullable(); // "Size Vừa (500g)", "Size Lớn (800g)"
    t.decimal("price_extra", 10, 2).notNullable().defaultTo(0); // phụ thu
    t.boolean("is_default").defaultTo(false);
    t.boolean("is_available").defaultTo(true);
    t.integer("sort_order").defaultTo(0);
    t.timestamps(true, true);
  });

export const down = (knex) =>
  knex.schema.dropTableIfExists("menu_item_variants");
