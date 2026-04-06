export const up = (knex) =>
  knex.schema.alterTable("reviews", (t) => {
    t.uuid("session_id").references("id").inTable("sessions");
  });

export const down = (knex) =>
  knex.schema.alterTable("reviews", (t) => {
    t.dropColumn("session_id");
  });
