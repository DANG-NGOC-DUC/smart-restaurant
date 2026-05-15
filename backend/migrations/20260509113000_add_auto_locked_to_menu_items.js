export const up = (knex) =>
  knex.schema.alterTable("menu_items", (t) => {
    t.boolean("auto_locked").notNullable().defaultTo(false);
  });

export const down = (knex) =>
  knex.schema.alterTable("menu_items", (t) => {
    t.dropColumn("auto_locked");
  });
