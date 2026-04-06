import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "menu_categories";

export const MenuCategoryModel = {
  async create(category) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...category })
      .returning("*");
    return created;
  },

  async findAll() {
    return knex(TABLE).select("*").orderBy("id", "asc");
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findByName(name, excludeId = null) {
    const query = knex(TABLE).whereRaw("LOWER(name) = ?", [name.toLowerCase()]);
    if (excludeId) {
      query.whereNot("id", excludeId);
    }
    return query.first();
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
