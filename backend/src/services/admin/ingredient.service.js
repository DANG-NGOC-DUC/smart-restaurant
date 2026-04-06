import { IngredientModel } from "../../models/ingredient.model.js";

const getAllIngredients = async () => {
  return IngredientModel.findAll();
};

const getIngredientById = async (id) => {
  return IngredientModel.findById(id);
};

const createIngredient = async (data) => {
  const { name, unit, min_stock } = data;

  if (!name || !unit) {
    throw new Error("Tên và đơn vị là bắt buộc.");
  }

  // Kiểm tra trùng tên
  const existing = await IngredientModel.findByName(name.trim());
  if (existing) {
    throw new Error("Nguyên liệu này đã tồn tại.");
  }

  return IngredientModel.create({
    name: name.trim(),
    unit: unit.trim(),
    min_stock: min_stock || 0,
  });
};

const updateIngredient = async (id, data) => {
  const ingredient = await IngredientModel.findById(id);
  if (!ingredient) return null;

  // Nếu đổi tên → kiểm tra trùng
  if (data.name && data.name.trim() !== ingredient.name) {
    const existing = await IngredientModel.findByName(data.name.trim());
    if (existing) {
      throw new Error("Tên nguyên liệu đã tồn tại.");
    }
    data.name = data.name.trim();
  }

  if (data.unit) data.unit = data.unit.trim();

  return IngredientModel.update(id, data);
};

const deleteIngredient = async (id) => {
  const ingredient = await IngredientModel.findById(id);
  if (!ingredient) return null;

  const deleted = await IngredientModel.remove(id);
  return deleted > 0;
};

const getRelatedDishes = async (ingredientId) => {
  const { MenuItemIngredientModel } =
    await import("../../models/menuItemIngredient.model.js");
  return MenuItemIngredientModel.findByIngredientId(ingredientId);
};

export const ingredientService = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getRelatedDishes,
};
