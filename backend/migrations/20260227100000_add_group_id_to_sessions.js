// Migration already applied - stub file to maintain consistency
export const up = (knex) =>
  knex.schema.alterTable("sessions", (t) => {
    // group_id already exists in DB
  });

export const down = (knex) =>
  knex.schema.alterTable("sessions", (t) => {
    // no-op
  });
