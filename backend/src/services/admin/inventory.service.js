import { InventoryModel } from "../../models/inventory.model.js";
import { IngredientModel } from "../../models/ingredient.model.js";
import {
  refreshAvailabilityByIngredients,
} from "../shared/menuAvailability.service.js";

const getAllInventory = async () => {
  return InventoryModel.findAll();
};

const getLowStock = async () => {
  const all = await InventoryModel.findAll();
  return all.filter(
    (item) => parseFloat(item.current_stock) <= parseFloat(item.min_stock),
  );
};

// Nhập kho - cộng thêm số lượng
const addStock = async (ingredientId, amount) => {
  if (!amount || amount <= 0) {
    throw new Error("Số lượng nhập phải lớn hơn 0.");
  }

  const ingredient = await IngredientModel.findById(ingredientId);
  if (!ingredient) {
    throw new Error("Nguyên liệu không tồn tại.");
  }

  // Nếu chưa có record inventory → tạo mới
  const existing = await InventoryModel.findByIngredientId(ingredientId);
  if (!existing) {
    const created = await InventoryModel.create({
      ingredient_id: ingredientId,
      current_stock: amount,
    });
    await refreshAvailabilityByIngredients([ingredientId]);
    return created;
  }

  const updated = await InventoryModel.addStock(ingredientId, amount);
  await refreshAvailabilityByIngredients([ingredientId]);
  return updated;
};

// Đặt lại số lượng tồn kho (kiểm kê)
const setStock = async (ingredientId, newStock) => {
  if (newStock === undefined || newStock === null || newStock < 0) {
    throw new Error("Số lượng tồn kho phải >= 0.");
  }

  const ingredient = await IngredientModel.findById(ingredientId);
  if (!ingredient) {
    throw new Error("Nguyên liệu không tồn tại.");
  }

  // Nếu chưa có record inventory → tạo mới
  const existing = await InventoryModel.findByIngredientId(ingredientId);
  if (!existing) {
    const created = await InventoryModel.create({
      ingredient_id: ingredientId,
      current_stock: newStock,
    });
    await refreshAvailabilityByIngredients([ingredientId]);
    return created;
  }

  const updated = await InventoryModel.updateStock(ingredientId, newStock);
  await refreshAvailabilityByIngredients([ingredientId]);
  return updated;
};

export const inventoryService = {
  getAllInventory,
  getLowStock,
  addStock,
  setStock,
};
