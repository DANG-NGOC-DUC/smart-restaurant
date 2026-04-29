export async function up(knex) {
  // Add 'chef' (bếp) role to the existing enum
  // Update the users table role column to include 'chef'

  // Use raw SQL to alter the check constraint
  await knex.raw(`
    ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check,
    ADD CONSTRAINT users_role_check CHECK (role IN ('guest', 'staff', 'cashier', 'chef', 'admin'))
  `);
}

export async function down(knex) {
  // Rollback: remove 'chef' from the enum
  await knex.raw(`
    ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check,
    ADD CONSTRAINT users_role_check CHECK (role IN ('guest', 'staff', 'cashier', 'admin'))
  `);
}
