import { ingredientService } from "../../services/admin/ingredient.service.js";
import {
  parseIngredientsFromText,
} from "../../services/admin/ingredientAi.service.js";

const getAllIngredients = async (req, res, next) => {
  try {
    const ingredients = await ingredientService.getAllIngredients();
    res.status(200).json(ingredients);
  } catch (error) {
    next(error);
  }
};

const getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ingredient = await ingredientService.getIngredientById(id);
    if (!ingredient) {
      return res.status(404).json({ error: "Nguyên liệu không tồn tại." });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    next(error);
  }
};

const createIngredient = async (req, res, next) => {
  try {
    const newIngredient = await ingredientService.createIngredient(req.body);
    res.status(201).json(newIngredient);
  } catch (error) {
    if (
      error.message.includes("bắt buộc") ||
      error.message.includes("đã tồn tại")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await ingredientService.updateIngredient(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Nguyên liệu không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (error.message.includes("đã tồn tại")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ingredientService.deleteIngredient(id);
    if (!deleted) {
      return res.status(404).json({ error: "Nguyên liệu không tồn tại." });
    }
    res.status(200).json({ message: "Xóa nguyên liệu thành công." });
  } catch (error) {
    next(error);
  }
};

const getRelatedDishes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ingredient = await ingredientService.getIngredientById(id);
    if (!ingredient) {
      return res.status(404).json({ error: "Nguyên liệu không tồn tại." });
    }
    const dishes = await ingredientService.getRelatedDishes(id);
    res.status(200).json(dishes);
  } catch (error) {
    next(error);
  }
};

const parseAiIngredients = async (req, res, next) => {
  try {
    const { text } = req.body || {};
    const result = await parseIngredientsFromText(text || "");
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("GEMINI_API_KEY")) {
      return res.status(500).json({ error: error.message });
    }
    if (error.statusCode === 503 || error.message.includes("quá tải")) {
      return res.status(503).json({ error: error.message });
    }
    if (error.message.includes("Nội dung nhập liệu")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const bulkUpsertIngredients = async (req, res, next) => {
  try {
    const { items } = req.body || {};
    const result = await ingredientService.bulkUpsertIngredients(items || []);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("Danh sách nguyên liệu")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const ingredientController = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getRelatedDishes,
  parseAiIngredients,
  bulkUpsertIngredients,
};
