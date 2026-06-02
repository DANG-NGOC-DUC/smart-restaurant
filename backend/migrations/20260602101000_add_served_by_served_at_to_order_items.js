export const up = (knex) =>
  knex.schema.table("order_items", (t) => {
    t.uuid("served_by")
      .nullable()
      .references("id")
      .inTable("users")
      .comment("Nhân viên phục vụ món");
    t.datetime("served_at").nullable().comment("Thời gian phục vụ món");
  });

export const down = (knex) =>
  knex.schema.table("order_items", (t) => {
    t.dropColumn("served_by");
    t.dropColumn("served_at");
  });
