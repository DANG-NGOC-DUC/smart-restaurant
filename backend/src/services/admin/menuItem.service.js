import { MenuItemModel } from "../../models/menuItem.model.js";
import { MenuCategoryModel } from "../../models/menuCategory.model.js";
import {
  uploadImageToSupabase,
  deleteImageFromSupabase,
} from "../../utils/upload.util.js";

const getAllMenuItems = async (filters) => {
  return MenuItemModel.findAll(filters);
};

const getMenuItemById = async (id) => {
  return MenuItemModel.findByIdFull(id);
};

const createMenuItem = async (data, file) => {
  const { name, price, category_id, description, is_available } = data;

  if (!name || !name.trim()) {
    throw new Error("Tên món ăn là bắt buộc.");
  }
  if (price === undefined || price === null || Number(price) <= 0) {
    throw new Error("Giá phải lớn hơn 0.");
  }

  // Kiểm tra danh mục tồn tại (nếu có)
  if (category_id) {
    const category = await MenuCategoryModel.findById(category_id);
    if (!category) {
      throw new Error("Danh mục không tồn tại.");
    }
  }

  // Upload ảnh nếu có
  let image_url = null;
  if (file) {
    image_url = await uploadImageToSupabase(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  return MenuItemModel.create({
    name: name.trim(),
    price: Number(price),
    category_id: category_id || null,
    description: description?.trim() || null,
    image_url,
    is_available: is_available !== undefined ? is_available : true,
  });
};

const updateMenuItem = async (id, data, file) => {
  const menuItem = await MenuItemModel.findById(id);
  if (!menuItem) return null;

  const updateData = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error("Tên món ăn không được rỗng.");
    }
    updateData.name = data.name.trim();
  }

  if (data.price !== undefined) {
    if (Number(data.price) <= 0) {
      throw new Error("Giá phải lớn hơn 0.");
    }
    updateData.price = Number(data.price);
  }

  if (data.category_id !== undefined) {
    if (data.category_id) {
      const category = await MenuCategoryModel.findById(data.category_id);
      if (!category) {
        throw new Error("Danh mục không tồn tại.");
      }
      updateData.category_id = data.category_id;
    } else {
      updateData.category_id = null;
    }
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }

  if (data.is_available !== undefined) {
    updateData.is_available =
      data.is_available === "true" || data.is_available === true;
    updateData.auto_locked = false;
  }

  // Upload ảnh mới nếu có
  if (file) {
    // Xóa ảnh cũ
    await deleteImageFromSupabase(menuItem.image_url);

    updateData.image_url = await uploadImageToSupabase(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  return MenuItemModel.update(id, updateData);
};

const deleteMenuItem = async (id) => {
  const menuItem = await MenuItemModel.findById(id);
  if (!menuItem) return null;

  // Xóa ảnh trên storage
  await deleteImageFromSupabase(menuItem.image_url);

  const deleted = await MenuItemModel.remove(id);
  return deleted > 0;
};

// Upload / thay ảnh riêng biệt
const uploadMenuItemImage = async (id, file) => {
  const menuItem = await MenuItemModel.findById(id);
  if (!menuItem) return null;

  if (!file) {
    throw new Error("Không có file ảnh được gửi lên.");
  }

  // Xóa ảnh cũ nếu có
  await deleteImageFromSupabase(menuItem.image_url);

  const image_url = await uploadImageToSupabase(
    file.buffer,
    file.originalname,
    file.mimetype,
  );

  return MenuItemModel.update(id, { image_url });
};

// Xóa ảnh
const deleteMenuItemImage = async (id) => {
  const menuItem = await MenuItemModel.findById(id);
  if (!menuItem) return null;

  if (!menuItem.image_url) {
    throw new Error("Món này chưa có ảnh.");
  }

  await deleteImageFromSupabase(menuItem.image_url);
  return MenuItemModel.update(id, { image_url: null });
};

export const menuItemService = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImage,
  deleteMenuItemImage,
};
