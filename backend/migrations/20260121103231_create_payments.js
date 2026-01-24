exports.up = (knex) =>
  knex.schema.createTable("payments", (t) => {
    t.uuid("id").primary();
    t.uuid("order_id").references("id").inTable("orders");
    t.string("method"); // cash | transfer | momo | bank
    t.string("status").defaultTo("pending");
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists("payments");
