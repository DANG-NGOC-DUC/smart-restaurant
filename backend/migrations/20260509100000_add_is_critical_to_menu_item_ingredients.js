export const up = async (knex) => {
  await knex.schema.alterTable("menu_item_ingredients", (t) => {
    t.boolean("is_critical").notNullable().defaultTo(true);
  });

  await knex("menu_item_ingredients")
    .whereNull("is_critical")
    .update({ is_critical: true });
};

export const down = async (knex) => {
  await knex.schema.alterTable("menu_item_ingredients", (t) => {
    t.dropColumn("is_critical");
  });
};
