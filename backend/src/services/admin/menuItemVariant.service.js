import { MenuItemVariantModel } from "../../models/menuItemVariant.model.js";
import { MenuItemModel } from "../../models/menuItem.model.js";

const getVariantsByMenuItem = async (menuItemId) => {
  const menuItem = await MenuItemModel.findById(menuItemId);
  if (!menuItem) throw new Error("Món ăn không tồn tại.");
  return MenuItemVariantModel.findByMenuItem(menuItemId);
};

const createVariant = async (menuItemId, data) => {
  const menuItem = await MenuItemModel.findById(menuItemId);
  if (!menuItem) throw new Error("Món ăn không tồn tại.");

  const { label, price_extra, is_default, is_available, sort_order } = data;

  if (!label || !label.trim()) {
    throw new Error("Tên biến thể là bắt buộc.");
  }
  if (
    price_extra === undefined ||
    price_extra === null ||
    Number(price_extra) < 0
  ) {
    throw new Error("Phụ thu phải >= 0.");
  }

  // Nếu đặt là default, bỏ default của các variant khác
  if (is_default) {
    const existing = await MenuItemVariantModel.findByMenuItem(menuItemId);
    for (const v of existing) {
      if (v.is_default) {
        await MenuItemVariantModel.update(v.id, { is_default: false });
      }
    }
  }

  const multiplier =
    data.ingredient_multiplier !== undefined
      ? Number(data.ingredient_multiplier)
      : 1.0;
  if (multiplier <= 0) throw new Error("Hệ số nguyên liệu phải > 0.");

  return MenuItemVariantModel.create({
    menu_item_id: menuItemId,
    label: label.trim(),
    price_extra: Number(price_extra),
    is_default: is_default || false,
    is_available: is_available !== undefined ? is_available : true,
    sort_order: sort_order !== undefined ? Number(sort_order) : 0,
    ingredient_multiplier: multiplier,
  });
};

const updateVariant = async (id, data) => {
  const variant = await MenuItemVariantModel.findById(id);
  if (!variant) return null;

  const updateData = {};

  if (data.label !== undefined) {
    if (!data.label.trim()) throw new Error("Tên biến thể không được rỗng.");
    updateData.label = data.label.trim();
  }
  if (data.price_extra !== undefined) {
    if (Number(data.price_extra) < 0) throw new Error("Phụ thu phải >= 0.");
    updateData.price_extra = Number(data.price_extra);
  }
  if (data.is_available !== undefined) {
    updateData.is_available =
      data.is_available === "true" || data.is_available === true;
  }
  if (data.sort_order !== undefined) {
    updateData.sort_order = Number(data.sort_order);
  }
  if (data.is_default !== undefined) {
    const isDefault = data.is_default === "true" || data.is_default === true;
    if (isDefault) {
      // Bỏ default của các variant khác cùng món
      const siblings = await MenuItemVariantModel.findByMenuItem(
        variant.menu_item_id,
      );
      for (const v of siblings) {
        if (v.is_default && v.id !== id) {
          await MenuItemVariantModel.update(v.id, { is_default: false });
        }
      }
    }
    updateData.is_default = isDefault;
  }
  if (data.ingredient_multiplier !== undefined) {
    const mul = Number(data.ingredient_multiplier);
    if (mul <= 0) throw new Error("Hệ số nguyên liệu phải > 0.");
    updateData.ingredient_multiplier = mul;
  }

  return MenuItemVariantModel.update(id, updateData);
};

const deleteVariant = async (id) => {
  const variant = await MenuItemVariantModel.findById(id);
  if (!variant) return null;
  const deleted = await MenuItemVariantModel.remove(id);
  return deleted > 0;
};

export const menuItemVariantService = {
  getVariantsByMenuItem,
  createVariant,
  updateVariant,
  deleteVariant,
};
