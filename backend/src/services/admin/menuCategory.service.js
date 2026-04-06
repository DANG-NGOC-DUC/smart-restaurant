import { MenuCategoryModel } from "../../models/menuCategory.model.js";

const getAllCategories = async () => {
  return MenuCategoryModel.findAll();
};

const getCategoryById = async (id) => {
  return MenuCategoryModel.findById(id);
};

const createCategory = async (data) => {
  const { name } = data;

  if (!name || !name.trim()) {
    throw new Error("Tên danh mục là bắt buộc.");
  }

  // Kiểm tra trùng tên
  const exists = await MenuCategoryModel.findByName(name.trim());
  if (exists) {
    throw new Error("Tên danh mục đã tồn tại.");
  }

  return MenuCategoryModel.create({ name: name.trim() });
};

const updateCategory = async (id, data) => {
  const category = await MenuCategoryModel.findById(id);
  if (!category) return null;

  if (data.name) {
    const trimmed = data.name.trim();
    if (!trimmed) {
      throw new Error("Tên danh mục không được rỗng.");
    }

    // Kiểm tra trùng tên (trừ chính nó)
    const exists = await MenuCategoryModel.findByName(trimmed, id);
    if (exists) {
      throw new Error("Tên danh mục đã tồn tại.");
    }

    data.name = trimmed;
  }

  return MenuCategoryModel.update(id, data);
};

const deleteCategory = async (id) => {
  const category = await MenuCategoryModel.findById(id);
  if (!category) return null;

  const deleted = await MenuCategoryModel.remove(id);
  return deleted > 0;
};

export const menuCategoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
