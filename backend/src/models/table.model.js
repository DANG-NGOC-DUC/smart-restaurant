import knex from "../db/knex.js";

const TABLE = "tables";

export const TableModel = {
  async create(data) {
    const [created] = await knex(TABLE).insert(data).returning("*");
    return created;
  },

  async findAll() {
    return knex(TABLE).select("*");
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },

  async remove(id) {
    return knex(TABLE).where({ id }).del();
  },
};
