import knex from "../db/knex.js";

const TABLE = "orders";

export const OrderModel = {
  async create(order) {
    // Lấy phần tử đầu tiên từ mảng kết quả trả về
    const [created] = await knex(TABLE).insert(order).returning("*");
    return created;
  },

  async findById(id) {
    // .first() trả về object thay vì mảng
    return knex(TABLE).where({ id }).first();
  },

  async findBySession(session_id) {
    return knex(TABLE).where({ session_id });
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
