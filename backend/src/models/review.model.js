import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "reviews";

export const ReviewModel = {
  async create(review) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...review })
      .returning("*");
    return created;
  },

  async findByOrder(order_id) {
    return knex(TABLE).where({ order_id });
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

  async remove(id) {
    return knex(TABLE).where({ id }).del();
  },
};
