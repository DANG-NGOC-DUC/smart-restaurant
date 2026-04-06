export const up = (knex) =>
  knex.schema.alterTable("sessions", (t) => {
    // Index composite cho query LEFT JOIN ... WHERE ended_at IS NULL
    t.index(["table_id", "ended_at"], "idx_sessions_table_ended");
    // Index cho lookup theo user
    t.index(["user_id", "ended_at"], "idx_sessions_user_ended");
  });

export const down = (knex) =>
  knex.schema.alterTable("sessions", (t) => {
    t.dropIndex([], "idx_sessions_table_ended");
    t.dropIndex([], "idx_sessions_user_ended");
  });
