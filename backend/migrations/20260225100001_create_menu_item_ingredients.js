export const up = (knex) =>
  knex.schema.createTable("menu_item_ingredients", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.uuid("menu_item_id")
      .notNullable()
      .references("id")
      .inTable("menu_items")
      .onDelete("CASCADE");
    t.uuid("ingredient_id")
      .notNullable()
      .references("id")
      .inTable("ingredients")
      .onDelete("CASCADE");
    t.decimal("quantity_needed", 10, 3).notNullable(); // Lượng cần cho 1 phần
    t.unique(["menu_item_id", "ingredient_id"]); // Mỗi món chỉ gắn 1 lần mỗi NL
    t.timestamps(true, true);
  });

export const down = (knex) =>
  knex.schema.dropTableIfExists("menu_item_ingredients");
