exports.up = function (knex) {
  return knex.schema.createTable("otp_sessions", function (table) {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("phone", 20).notNullable();
    table.string("otp_code", 10).notNullable();
    table.timestamp("expires_at").notNullable();
    table.boolean("verified").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index(["phone"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("otp_sessions");
};
