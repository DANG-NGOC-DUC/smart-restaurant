export const up = (knex) =>
  knex.schema.createTable("inventory", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.uuid("ingredient_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("ingredients")
      .onDelete("CASCADE");
    t.decimal("current_stock", 10, 3).notNullable().defaultTo(0);
    t.timestamp("last_updated").defaultTo(knex.fn.now());
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTableIfExists("inventory");
