import { recipeService } from "../../services/admin/recipe.service.js";

const getRecipe = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const result = await recipeService.getRecipe(menuItemId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

const setRecipe = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const { ingredients } = req.body;
    const result = await recipeService.setRecipe(menuItemId, ingredients);
    res.status(200).json(result);
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("không được rỗng") ||
      error.message.includes("cần có") ||
      error.message.includes("lớn hơn 0") ||
      error.message.includes("trùng")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateRecipeItem = async (req, res, next) => {
  try {
    const { menuItemId, ingredientId } = req.params;
    const { quantity_needed } = req.body;
    const result = await recipeService.updateRecipeItem(
      menuItemId,
      ingredientId,
      quantity_needed,
    );
    res.status(200).json(result);
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("không có trong") ||
      error.message.includes("lớn hơn 0")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const removeRecipeItem = async (req, res, next) => {
  try {
    const { menuItemId, ingredientId } = req.params;
    const result = await recipeService.removeRecipeItem(
      menuItemId,
      ingredientId,
    );
    if (!result) {
      return res.status(500).json({ error: "Xóa thất bại." });
    }
    res.status(200).json({ message: "Đã xóa nguyên liệu khỏi công thức." });
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("không có trong")
    ) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const recipeController = {
  getRecipe,
  setRecipe,
  updateRecipeItem,
  removeRecipeItem,
};
