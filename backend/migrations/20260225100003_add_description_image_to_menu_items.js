export const up = (knex) =>
  knex.schema.alterTable("menu_items", (t) => {
    t.text("description").nullable().after("name");
    t.string("image_url").nullable().after("description");
  });

export const down = (knex) =>
  knex.schema.alterTable("menu_items", (t) => {
    t.dropColumn("description");
    t.dropColumn("image_url");
  });
