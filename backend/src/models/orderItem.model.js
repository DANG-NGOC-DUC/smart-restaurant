import knex from "../db/knex.js";

const TABLE = "order_items";

export const OrderItemModel = {
  async create(item) {
    const [created] = await knex(TABLE).insert(item).returning("*");
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

  async remove(id) {
    return knex(TABLE).where({ id }).del();
  },
};
