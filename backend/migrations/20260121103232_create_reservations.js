exports.up = (knex) =>
  knex.schema.createTable("reservations", (t) => {
    t.uuid("id").primary();
    t.uuid("user_id").references("id").inTable("users");
    t.uuid("table_id").references("id").inTable("tables");
    t.timestamp("reserved_at").notNullable();
    t.string("status").defaultTo("pending");
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("reservations");
