import knex from "../db/knex.js";

const TABLE = "inventory";

export const InventoryModel = {
  async create(data) {
    const [created] = await knex(TABLE).insert(data).returning("*");
    return created;
  },

  // Lấy tồn kho kèm tên nguyên liệu
  async findAll() {
    return knex(TABLE)
      .join("ingredients", "ingredients.id", `${TABLE}.ingredient_id`)
      .select(
        `${TABLE}.id`,
        `${TABLE}.ingredient_id`,
        `${TABLE}.current_stock`,
        `${TABLE}.last_updated`,
        "ingredients.name as ingredient_name",
        "ingredients.unit",
        "ingredients.min_stock",
      )
      .orderBy("ingredients.name", "asc");
  },

  async findByIngredientId(ingredientId) {
    return knex(TABLE).where({ ingredient_id: ingredientId }).first();
  },

  // Cập nhật số lượng tồn kho
  async updateStock(ingredientId, newStock) {
    const [updated] = await knex(TABLE)
      .where({ ingredient_id: ingredientId })
      .update({
        current_stock: newStock,
        last_updated: knex.fn.now(),
      })
      .returning("*");
    return updated;
  },

  // Trừ kho khi order (trừ số lượng)
  async deductStock(ingredientId, amount) {
    const [updated] = await knex(TABLE)
      .where({ ingredient_id: ingredientId })
      .update({
        current_stock: knex.raw("current_stock - ?", [amount]),
        last_updated: knex.fn.now(),
      })
      .returning("*");
    return updated;
  },

  // Nhập kho (cộng số lượng)
  async addStock(ingredientId, amount) {
    const [updated] = await knex(TABLE)
      .where({ ingredient_id: ingredientId })
      .update({
        current_stock: knex.raw("current_stock + ?", [amount]),
        last_updated: knex.fn.now(),
      })
      .returning("*");
    return updated;
  },

  // Kiểm tra món ăn có đủ nguyên liệu không (tính theo hệ số variant)
  async checkAvailability(menuItemId, ingredientMultiplier = 1.0) {
    const result = await knex("menu_item_ingredients as mii")
      .join(`${TABLE} as inv`, "inv.ingredient_id", "mii.ingredient_id")
      .where("mii.menu_item_id", menuItemId)
      .select("mii.ingredient_id", "mii.quantity_needed", "inv.current_stock");

    // Nếu món không có công thức nguyên liệu → luôn available
    if (result.length === 0) return true;

    // Kiểm tra tất cả nguyên liệu đều đủ (nhân hệ số variant)
    const mul = parseFloat(ingredientMultiplier) || 1.0;
    return result.every(
      (row) =>
        parseFloat(row.current_stock) >= parseFloat(row.quantity_needed) * mul,
    );
  },

  async remove(id) {
    return knex(TABLE).where({ id }).del();
  },
};
