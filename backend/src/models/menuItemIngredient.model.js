import knex from "../db/knex.js";

const TABLE = "menu_item_ingredients";

export const MenuItemIngredientModel = {
  // Gắn nguyên liệu vào món
  async create(data) {
    const [created] = await knex(TABLE).insert(data).returning("*");
    return created;
  },

  // Gắn nhiều nguyên liệu cùng lúc cho 1 món
  async bulkCreate(menuItemId, ingredients) {
    const rows = ingredients.map((ing) => ({
      menu_item_id: menuItemId,
      ingredient_id: ing.ingredient_id,
      quantity_needed: ing.quantity_needed,
      is_critical: ing.is_critical === undefined ? true : ing.is_critical,
    }));
    return knex(TABLE).insert(rows).returning("*");
  },

  // Lấy tất cả nguyên liệu của 1 món (kèm tên + đơn vị)
  async findByMenuItemId(menuItemId, trx = knex) {
    return trx(TABLE)
      .join("ingredients", "ingredients.id", `${TABLE}.ingredient_id`)
      .where(`${TABLE}.menu_item_id`, menuItemId)
      .select(
        `${TABLE}.id`,
        `${TABLE}.ingredient_id`,
        `${TABLE}.quantity_needed`,
        `${TABLE}.is_critical`,
        "ingredients.name as ingredient_name",
        "ingredients.unit",
      );
  },

  // Lấy tất cả món dùng 1 nguyên liệu
  async findByIngredientId(ingredientId, trx = knex) {
    return trx(TABLE)
      .join("menu_items", "menu_items.id", `${TABLE}.menu_item_id`)
      .where(`${TABLE}.ingredient_id`, ingredientId)
      .select(
        `${TABLE}.id`,
        `${TABLE}.menu_item_id`,
        `${TABLE}.quantity_needed`,
        "menu_items.name as menu_item_name",
      );
  },

  // Cập nhật lượng nguyên liệu cần cho 1 công thức
  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },

  // Xóa 1 nguyên liệu khỏi công thức
  async remove(id) {
    return knex(TABLE).where({ id }).del();
  },

  // Xóa tất cả nguyên liệu của 1 món (khi cập nhật lại công thức)
  async removeByMenuItemId(menuItemId) {
    return knex(TABLE).where({ menu_item_id: menuItemId }).del();
  },
};
