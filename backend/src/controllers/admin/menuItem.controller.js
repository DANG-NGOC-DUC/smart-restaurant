import { menuItemService } from "../../services/admin/menuItem.service.js";

const getAllMenuItems = async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      is_available:
        req.query.is_available !== undefined
          ? req.query.is_available === "true"
          : undefined,
      search: req.query.search,
    };
    const items = await menuItemService.getAllMenuItems(filters);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await menuItemService.getMenuItemById(id);
    if (!item) {
      return res.status(404).json({ error: "Món ăn không tồn tại." });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const newItem = await menuItemService.createMenuItem(req.body, req.file);
    res.status(201).json(newItem);
  } catch (error) {
    if (
      error.message.includes("bắt buộc") ||
      error.message.includes("lớn hơn 0") ||
      error.message.includes("không tồn tại") ||
      error.message.includes("Upload")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await menuItemService.updateMenuItem(
      id,
      req.body,
      req.file,
    );
    if (!updated) {
      return res.status(404).json({ error: "Món ăn không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (
      error.message.includes("không được rỗng") ||
      error.message.includes("lớn hơn 0") ||
      error.message.includes("không tồn tại") ||
      error.message.includes("Upload")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await menuItemService.deleteMenuItem(id);
    if (!deleted) {
      return res.status(404).json({ error: "Món ăn không tồn tại." });
    }
    res.status(200).json({ message: "Xóa món ăn thành công." });
  } catch (error) {
    next(error);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await menuItemService.uploadMenuItemImage(id, req.file);
    if (!updated) {
      return res.status(404).json({ error: "Món ăn không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (
      error.message.includes("Không có file") ||
      error.message.includes("Upload")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await menuItemService.deleteMenuItemImage(id);
    if (!updated) {
      return res.status(404).json({ error: "Món ăn không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (error.message.includes("chưa có ảnh")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const menuItemController = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage,
  deleteImage,
};
