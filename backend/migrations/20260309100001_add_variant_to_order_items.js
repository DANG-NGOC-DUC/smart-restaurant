export const up = (knex) =>
  knex.schema.alterTable("order_items", (t) => {
    t.uuid("variant_id")
      .nullable()
      .references("id")
      .inTable("menu_item_variants")
      .onDelete("SET NULL");
    t.string("variant_label").nullable(); // snapshot tên variant tại thời điểm đặt
  });

export const down = (knex) =>
  knex.schema.alterTable("order_items", (t) => {
    t.dropColumn("variant_label");
    t.dropColumn("variant_id");
  });
