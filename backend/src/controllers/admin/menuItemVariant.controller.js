import { menuItemVariantService } from "../../services/admin/menuItemVariant.service.js";

const getVariants = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const variants =
      await menuItemVariantService.getVariantsByMenuItem(menuItemId);
    res.status(200).json(variants);
  } catch (error) {
    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

const createVariant = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const variant = await menuItemVariantService.createVariant(
      menuItemId,
      req.body,
    );
    res.status(201).json(variant);
  } catch (error) {
    if (
      error.message.includes("bắt buộc") ||
      error.message.includes(">=") ||
      error.message.includes("không tồn tại")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await menuItemVariantService.updateVariant(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Biến thể không tồn tại." });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (error.message.includes("rỗng") || error.message.includes(">=")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await menuItemVariantService.deleteVariant(id);
    if (!deleted) {
      return res.status(404).json({ error: "Biến thể không tồn tại." });
    }
    res.status(200).json({ message: "Xóa biến thể thành công." });
  } catch (error) {
    next(error);
  }
};

export const menuItemVariantController = {
  getVariants,
  createVariant,
  updateVariant,
  deleteVariant,
};
