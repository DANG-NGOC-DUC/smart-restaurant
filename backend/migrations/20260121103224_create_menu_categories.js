exports.up = (knex) =>
  knex.schema.createTable("menu_categories", (t) => {
    t.uuid("id").primary();
    t.string("name").notNullable();
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("menu_categories");
