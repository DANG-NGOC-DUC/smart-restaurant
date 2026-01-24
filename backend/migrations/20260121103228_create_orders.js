exports.up = (knex) =>
  knex.schema.createTable("orders", (t) => {
    t.uuid("id").primary();
    t.uuid("session_id").references("id").inTable("sessions");
    t.decimal("total_price", 10, 2).defaultTo(0);
    t.string("status").defaultTo("pending");
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("orders");
