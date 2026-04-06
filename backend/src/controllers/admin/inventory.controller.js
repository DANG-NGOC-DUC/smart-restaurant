import { inventoryService } from "../../services/admin/inventory.service.js";

const getAllInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getAllInventory();
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const lowStock = await inventoryService.getLowStock();
    res.status(200).json(lowStock);
  } catch (error) {
    next(error);
  }
};

const addStock = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    const { amount } = req.body;
    const updated = await inventoryService.addStock(ingredientId, amount);
    res.status(200).json(updated);
  } catch (error) {
    if (
      error.message.includes("lớn hơn 0") ||
      error.message.includes("không tồn tại")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const setStock = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    const { stock } = req.body;
    const updated = await inventoryService.setStock(ingredientId, stock);
    res.status(200).json(updated);
  } catch (error) {
    if (
      error.message.includes(">= 0") ||
      error.message.includes("không tồn tại")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const inventoryController = {
  getAllInventory,
  getLowStock,
  addStock,
  setStock,
};
