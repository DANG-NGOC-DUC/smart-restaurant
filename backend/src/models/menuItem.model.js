import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "menu_items";

export const MenuItemModel = {
  async create(item) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...item })
      .returning("*");
    return created;
  },

  // Lấy tất cả món – kèm tên danh mục
  async findAll(filters = {}) {
    const query = knex(TABLE)
      .leftJoin("menu_categories", "menu_categories.id", `${TABLE}.category_id`)
      .select(`${TABLE}.*`, "menu_categories.name as category_name")
      .orderBy(`${TABLE}.created_at`, "desc");

    if (filters.category_id) {
      query.where(`${TABLE}.category_id`, filters.category_id);
    }
    if (filters.is_available !== undefined && filters.is_available !== null) {
      const val =
        filters.is_available === true || filters.is_available === "true";
      query.where(`${TABLE}.is_available`, val);
    }
    if (filters.search) {
      query.whereILike(`${TABLE}.name`, `%${filters.search}%`);
    }

    return query;
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  // Lấy chi tiết 1 món – kèm danh mục + nguyên liệu
  async findByIdFull(id) {
    const menuItem = await knex(TABLE)
      .leftJoin("menu_categories", "menu_categories.id", `${TABLE}.category_id`)
      .where(`${TABLE}.id`, id)
      .select(`${TABLE}.*`, "menu_categories.name as category_name")
      .first();

    if (!menuItem) return null;

    const ingredients = await knex("menu_item_ingredients")
      .join(
        "ingredients",
        "ingredients.id",
        "menu_item_ingredients.ingredient_id",
      )
      .where("menu_item_ingredients.menu_item_id", id)
      .select(
        "menu_item_ingredients.id",
        "menu_item_ingredients.ingredient_id",
        "menu_item_ingredients.quantity_needed",
        "ingredients.name as ingredient_name",
        "ingredients.unit",
      );

    return { ...menuItem, ingredients };
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
