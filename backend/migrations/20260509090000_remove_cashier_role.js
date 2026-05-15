export async function up(knex) {
  await knex.raw(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check,
    ADD CONSTRAINT users_role_check CHECK (role IN ('guest', 'staff', 'chef', 'admin'))
  `);
}

export async function down(knex) {
  await knex.raw(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check,
    ADD CONSTRAINT users_role_check CHECK (role IN ('guest', 'staff', 'cashier', 'chef', 'admin'))
  `);
}
