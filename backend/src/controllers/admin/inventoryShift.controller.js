import { inventoryShiftService } from "../../services/admin/inventoryShift.service.js";

const getOpenShift = async (req, res, next) => {
  try {
    const shift = await inventoryShiftService.getOpenShift();
    if (!shift) {
      return res.status(200).json(null);
    }
    res.status(200).json(shift);
  } catch (error) {
    next(error);
  }
};

const getShiftById = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const shift = await inventoryShiftService.getShiftById(shiftId);
    if (!shift) {
      return res.status(404).json({ error: "Ca kiểm kê không tồn tại." });
    }
    res.status(200).json(shift);
  } catch (error) {
    next(error);
  }
};

const startShift = async (req, res, next) => {
  try {
    const { name, ingredient_ids } = req.body;
    const opened_by = req.user?.id || null;
    const shift = await inventoryShiftService.startShift({
      name,
      ingredient_ids,
      opened_by,
    });
    res.status(201).json(shift);
  } catch (error) {
    if (
      error.message.includes("đang có ca") ||
      error.message.includes("không hợp lệ")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const closeShift = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const { items } = req.body;
    const closed_by = req.user?.id || null;
    const shift = await inventoryShiftService.closeShift({
      shiftId,
      items,
      closed_by,
    });
    res.status(200).json(shift);
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("đã đóng") ||
      error.message.includes("không được rỗng") ||
      error.message.includes("ingredient_id") ||
      error.message.includes("closing_stock") ||
      error.message.includes("tất cả nguyên liệu") ||
      error.message.includes("Thiếu tồn")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const inventoryShiftController = {
  getOpenShift,
  getShiftById,
  startShift,
  closeShift,
};
