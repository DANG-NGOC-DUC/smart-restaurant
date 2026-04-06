import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "payments";

export const PaymentModel = {
  async create(payment) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...payment })
      .returning("*");
    return created;
  },

  async findByOrder(order_id) {
    return knex(TABLE).where({ order_id });
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },
};
