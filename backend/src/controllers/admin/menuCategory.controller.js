import { menuCategoryService } from "../../services/admin/menuCategory.service.js";

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await menuCategoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await menuCategoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: "Danh mục không tồn tại." });
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const newCategory = await menuCategoryService.createCategory(req.body);
    res.status(201).json(newCategory);
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

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await menuCategoryService.updateCategory(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Danh mục không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (
      error.message.includes("đã tồn tại") ||
      error.message.includes("không được rỗng")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await menuCategoryService.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ error: "Danh mục không tồn tại." });
    }
    res.status(200).json({ message: "Xóa danh mục thành công." });
  } catch (error) {
    next(error);
  }
};

export const menuCategoryController = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
