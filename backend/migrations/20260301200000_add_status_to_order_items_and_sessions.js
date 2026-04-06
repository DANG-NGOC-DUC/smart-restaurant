/**
 * Thêm cột status + created_at cho order_items
 * Thêm cột status cho sessions (để phân biệt open / dirty / closed)
 */
export const up = async (knex) => {
  // --- order_items: thêm status và created_at ---
  await knex.schema.alterTable("order_items", (t) => {
    t.string("status").defaultTo("pending").notNullable();
    // pending → confirmed → processing → ready → served → cancelled
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // --- sessions: thêm status ---
  await knex.schema.alterTable("sessions", (t) => {
    t.string("status").defaultTo("open").notNullable();
    // open → dirty → closed
  });

  // Cập nhật sessions hiện có: nếu ended_at != null → closed, ngược lại → open
  await knex.raw(`
    UPDATE sessions
    SET status = CASE
      WHEN ended_at IS NOT NULL THEN 'closed'
      ELSE 'open'
    END
  `);
};

export const down = async (knex) => {
  await knex.schema.alterTable("order_items", (t) => {
    t.dropColumn("status");
    t.dropColumn("created_at");
  });
  await knex.schema.alterTable("sessions", (t) => {
    t.dropColumn("status");
  });
};
