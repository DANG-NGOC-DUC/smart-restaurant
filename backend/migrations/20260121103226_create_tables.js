exports.up = (knex) =>
  knex.schema.createTable("tables", (t) => {
    t.uuid("id").primary();
    t.string("code").notNullable().unique(); // mã bàn / QR
    t.integer("capacity");
    t.boolean("is_active").defaultTo(true);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("tables");
