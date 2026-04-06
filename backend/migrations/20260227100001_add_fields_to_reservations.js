// Migration already applied - stub file to maintain consistency
export const up = (knex) =>
  knex.schema.alterTable("reservations", (t) => {
    // fields already exist in DB
  });

export const down = (knex) =>
  knex.schema.alterTable("reservations", (t) => {
    // no-op
  });
