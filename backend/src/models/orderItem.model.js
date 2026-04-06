import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "order_items";

export const OrderItemModel = {
  async create(item) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...item })
      .returning("*");
    return created;
  },

  async findByOrder(order_id) {
    return knex(TABLE).where({ order_id });
  },

  // Lấy order items kèm tên món ăn
  async findByOrderWithDetails(order_id) {
    return knex(TABLE)
      .leftJoin("menu_items", "menu_items.id", `${TABLE}.menu_item_id`)
      .where(`${TABLE}.order_id`, order_id)
      .select(
        `${TABLE}.*`,
        "menu_items.name as menu_item_name",
        "menu_items.image_url",
      );
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
