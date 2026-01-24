import knex from "../db/knex.js";

const TABLE = "sessions";

export const SessionModel = {
  async create(session) {
    const [created] = await knex(TABLE).insert(session).returning("*");
    return created;
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findByUser(user_id) {
    return knex(TABLE).where({ user_id });
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },
};
