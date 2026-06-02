export const up = (knex) =>
  knex.schema.table("order_items", (t) => {
    t.uuid("delivered_by")
      .nullable()
      .references("id")
      .inTable("users")
      .comment("Nhân viên giao món");
    t.datetime("delivering_at")
      .nullable()
      .comment("Thời gian bắt đầu giao món");
  });

export const down = (knex) =>
  knex.schema.table("order_items", (t) => {
    t.dropColumn("delivered_by");
    t.dropColumn("delivering_at");
  });
