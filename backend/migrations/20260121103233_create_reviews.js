export const up = (knex) =>
  knex.schema.createTable("reviews", (t) => {
    t.uuid("id").primary();
    t.uuid("user_id").references("id").inTable("users");
    t.uuid("order_id").references("id").inTable("orders");
    t.integer("rating"); // 1–5
    t.text("comment");
    t.timestamps(true, true);
  });

export const down = (knex) => knex.schema.dropTableIfExists("reviews");
