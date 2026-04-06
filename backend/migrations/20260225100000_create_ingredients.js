export const up = (knex) =>
  knex.schema.createTable("ingredients", (t) => {
    t.uuid("id").primary().defaultTo(knex.fn.uuid());
    t.string("name").notNullable().unique();
    t.string("unit").notNullable(); // kg, g, lít, quả, gói...
    t.decimal("min_stock", 10, 2).defaultTo(0); // Ngưỡng cảnh báo hết
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTableIfExists("ingredients");
