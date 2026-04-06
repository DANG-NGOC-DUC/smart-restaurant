import knex from "../db/knex.js";

const TABLE = "ingredients";

export const IngredientModel = {
  async create(data) {
    const [created] = await knex(TABLE).insert(data).returning("*");
    return created;
  },

  async findAll() {
    return knex(TABLE).select("*").orderBy("name", "asc");
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findByName(name) {
    return knex(TABLE).where({ name }).first();
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
