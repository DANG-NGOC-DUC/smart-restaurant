export const up = (knex) =>
  knex.schema.alterTable("order_items", (t) => {
    t.text("cancel_reason").nullable();
    t.uuid("cancelled_by").nullable().references("id").inTable("users");
    t.timestamp("cancelled_at").nullable();
  });

export const down = (knex) =>
  knex.schema.alterTable("order_items", (t) => {
    t.dropColumn("cancel_reason");
    t.dropColumn("cancelled_by");
    t.dropColumn("cancelled_at");
  });
