export const up = (knex) =>
  knex.schema
    .createTable("inventory_shifts", (t) => {
      t.uuid("id").primary().defaultTo(knex.fn.uuid());
      t.string("name");
      t.string("status").notNullable().defaultTo("open");
      t.timestamp("opened_at").defaultTo(knex.fn.now());
      t.timestamp("closed_at");
      t.uuid("opened_by").references("id").inTable("users").onDelete("SET NULL");
      t.uuid("closed_by").references("id").inTable("users").onDelete("SET NULL");
      t.timestamps(true, true);
    })
    .createTable("inventory_shift_items", (t) => {
      t.uuid("id").primary().defaultTo(knex.fn.uuid());
      t.uuid("shift_id")
        .notNullable()
        .references("id")
        .inTable("inventory_shifts")
        .onDelete("CASCADE");
      t.uuid("ingredient_id")
        .notNullable()
        .references("id")
        .inTable("ingredients")
        .onDelete("CASCADE");
      t.decimal("opening_stock", 10, 3).notNullable().defaultTo(0);
      t.decimal("closing_stock", 10, 3);
      t.decimal("consumed", 10, 3);
      t.timestamps(true, true);
      t.unique(["shift_id", "ingredient_id"]);
    });

export const down = (knex) =>
  knex.schema
    .dropTableIfExists("inventory_shift_items")
    .dropTableIfExists("inventory_shifts");
