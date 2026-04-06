import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "sessions";

export const SessionModel = {
  async create(session) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...session })
      .returning("*");
    return created;
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async findByUser(user_id) {
    return knex(TABLE).where({ user_id });
  },

  async findActiveByTableId(tableId) {
    return knex(TABLE)
      .where({ table_id: tableId, status: "open" })
      .whereNull("ended_at")
      .first();
  },

  async findActiveByUserId(userId) {
    return knex(TABLE).where({ user_id: userId }).whereNull("ended_at").first();
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },

  async deleteByTableId(tableId) {
    return knex(TABLE).where({ table_id: tableId }).del();
  },
};
