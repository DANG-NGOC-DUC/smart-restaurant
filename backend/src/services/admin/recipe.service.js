import { MenuItemIngredientModel } from "../../models/menuItemIngredient.model.js";
import { MenuItemModel } from "../../models/menuItem.model.js";
import { IngredientModel } from "../../models/ingredient.model.js";
import {
  refreshAvailabilityForMenuItems,
} from "../shared/menuAvailability.service.js";

// Lấy công thức (danh sách nguyên liệu) của 1 món
const getRecipe = async (menuItemId) => {
  const menuItem = await MenuItemModel.findById(menuItemId);
  if (!menuItem) {
    throw new Error("Món ăn không tồn tại.");
  }

  const ingredients =
    await MenuItemIngredientModel.findByMenuItemId(menuItemId);
  return { menuItem, ingredients };
};

// Gán công thức cho 1 món (xóa cũ, thêm mới - bulk)
const setRecipe = async (menuItemId, ingredients) => {
  const menuItem = await MenuItemModel.findById(menuItemId);
  if (!menuItem) {
    throw new Error("Món ăn không tồn tại.");
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Danh sách nguyên liệu không được rỗng.");
  }

  // Validate từng nguyên liệu
  const normalized = ingredients.map((ing) => {
    if (!ing.ingredient_id || !ing.quantity_needed) {
      throw new Error(
        "Mỗi nguyên liệu cần có ingredient_id và quantity_needed.",
      );
    }
    if (ing.quantity_needed <= 0) {
      throw new Error("quantity_needed phải lớn hơn 0.");
    }
    if (ing.is_critical !== undefined && typeof ing.is_critical !== "boolean") {
      throw new Error("is_critical phải là true/false.");
    }
    return {
      ...ing,
      is_critical: ing.is_critical === undefined ? true : ing.is_critical,
    };
  });

  for (const ing of normalized) {
    const exists = await IngredientModel.findById(ing.ingredient_id);
    if (!exists) {
      throw new Error(`Nguyên liệu ID ${ing.ingredient_id} không tồn tại.`);
    }
  }

  // Kiểm tra trùng ingredient_id
  const ids = normalized.map((i) => i.ingredient_id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Không được trùng nguyên liệu trong công thức.");
  }

  // Xóa công thức cũ → thêm mới
  await MenuItemIngredientModel.removeByMenuItemId(menuItemId);
  const created = await MenuItemIngredientModel.bulkCreate(
    menuItemId,
    normalized,
  );
  await refreshAvailabilityForMenuItems([menuItemId]);
  return created;
};

// Cập nhật lượng nguyên liệu cho 1 dòng trong công thức
const updateRecipeItem = async (menuItemId, ingredientId, data) => {
  const menuItem = await MenuItemModel.findById(menuItemId);
  if (!menuItem) {
    throw new Error("Món ăn không tồn tại.");
  }

  const { quantity_needed, is_critical } = data || {};
  if (quantity_needed === undefined && is_critical === undefined) {
    throw new Error("Cần quantity_needed hoặc is_critical.");
  }
  if (quantity_needed !== undefined && quantity_needed <= 0) {
    throw new Error("quantity_needed phải lớn hơn 0.");
  }
  if (is_critical !== undefined && typeof is_critical !== "boolean") {
    throw new Error("is_critical phải là true/false.");
  }

  // Tìm dòng công thức theo menu_item_id + ingredient_id
  const allIngredients =
    await MenuItemIngredientModel.findByMenuItemId(menuItemId);
  const recipeItem = allIngredients.find(
    (r) => r.ingredient_id === ingredientId,
  );

  if (!recipeItem) {
    throw new Error("Nguyên liệu này không có trong công thức của món.");
  }

  const updateData = {};
  if (quantity_needed !== undefined) {
    updateData.quantity_needed = quantity_needed;
  }
  if (is_critical !== undefined) {
    updateData.is_critical = is_critical;
  }

  const updated = await MenuItemIngredientModel.update(
    recipeItem.id,
    updateData,
  );
  await refreshAvailabilityForMenuItems([menuItemId]);
  return updated;
};

// Xóa 1 nguyên liệu khỏi công thức
const removeRecipeItem = async (menuItemId, ingredientId) => {
  const menuItem = await MenuItemModel.findById(menuItemId);
  if (!menuItem) {
    throw new Error("Món ăn không tồn tại.");
  }

  const allIngredients =
    await MenuItemIngredientModel.findByMenuItemId(menuItemId);
  const recipeItem = allIngredients.find(
    (r) => r.ingredient_id === ingredientId,
  );

  if (!recipeItem) {
    throw new Error("Nguyên liệu này không có trong công thức của món.");
  }

  const deleted = await MenuItemIngredientModel.remove(recipeItem.id);
  await refreshAvailabilityForMenuItems([menuItemId]);
  return deleted > 0;
};

export const recipeService = {
  getRecipe,
  setRecipe,
  updateRecipeItem,
  removeRecipeItem,
};
