export const up = (knex) =>
  knex.schema.alterTable("order_items", (t) => {
    t.text("note").nullable();
  });

export const down = (knex) =>
  knex.schema.alterTable("order_items", (t) => {
    t.dropColumn("note");
  });
