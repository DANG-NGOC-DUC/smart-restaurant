import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "menu_item_variants";

export const MenuItemVariantModel = {
  async create(variant) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...variant })
      .returning("*");
    return created;
  },

  async findByMenuItem(menu_item_id) {
    return knex(TABLE)
      .where({ menu_item_id })
      .orderBy("sort_order", "asc")
      .orderBy("created_at", "asc");
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findAvailableByMenuItem(menu_item_id) {
    return knex(TABLE)
      .where({ menu_item_id, is_available: true })
      .orderBy("sort_order", "asc")
      .orderBy("created_at", "asc");
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

  async removeByMenuItem(menu_item_id) {
    return knex(TABLE).where({ menu_item_id }).del();
  },
};
