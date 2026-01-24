exports.up = (knex) =>
  knex.schema.createTable("sessions", (t) => {
    t.uuid("id").primary();
    t.uuid("table_id").references("id").inTable("tables");
    t.uuid("user_id").references("id").inTable("users");
    t.timestamp("started_at").defaultTo(knex.fn.now());
    t.timestamp("ended_at");
  });

exports.down = (knex) => knex.schema.dropTableIfExists("sessions");
