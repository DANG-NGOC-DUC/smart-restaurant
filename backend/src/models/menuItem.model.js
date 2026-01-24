import knex from "../db/knex.js"; // Đổi đường dẫn cho đúng với cấu trúc thư mục của bạn

const TABLE = "menu_items";

export const MenuItemModel = {
  async create(item) {
    const [created] = await knex(TABLE).insert(item).returning("*");
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
