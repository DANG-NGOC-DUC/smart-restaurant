import knex from "../db/knex.js";

const TABLE = "users";

export const UserModel = {
  async create(user) {
    const [created] = await knex(TABLE).insert(user).returning("*");
    return created;
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findByEmail(email) {
    return knex(TABLE).where({ email }).first();
  },

  async findByPhone(phone) {
    return knex(TABLE).where({ phone }).first();
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },
};
