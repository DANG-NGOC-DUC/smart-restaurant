import { MenuCategoryModel } from "../../models/menuCategory.model.js";
import { MenuItemModel } from "../../models/menuItem.model.js";
import { MenuItemVariantModel } from "../../models/menuItemVariant.model.js";
import { InventoryModel } from "../../models/inventory.model.js";

// Gắn variants + kiểm tra tồn kho cho 1 món
const enrichItem = async (item) => {
  const variants = await MenuItemVariantModel.findAvailableByMenuItem(item.id);

  // Nếu có variants: món còn hàng khi ít nhất 1 variant còn nguyên liệu
  let is_in_stock;
  if (variants.length > 0) {
    const checks = await Promise.all(
      variants.map((v) =>
        InventoryModel.checkAvailability(
          item.id,
          v.ingredient_multiplier ?? 1.0,
          { criticalOnly: true },
        ),
      ),
    );
    is_in_stock = checks.some(Boolean);
  } else {
    is_in_stock = await InventoryModel.checkAvailability(item.id, 1.0, {
      criticalOnly: true,
    });
  }

  return { ...item, variants, is_in_stock };
};

// Filter items based on status and availability
// Show items with status "available" or "low", hide "out_of_stock" items
const shouldShowItem = (item) => {
  if (!item.is_available) return false;
  // If status field exists, filter by it. If not, fall back to is_available check
  if (item.status) {
    return item.status !== "out";
  }
  return true;
};

const getPublicMenu = async (filters = {}) => {
  // Get all menu items with is_available=true
  const menuItems = await MenuItemModel.findAll({
    ...filters,
    is_available: true,
  });

  // Filter by status (show available and low, hide out)
  const filteredItems = menuItems.filter(shouldShowItem);

  return Promise.all(filteredItems.map(enrichItem));
};

const getMenuGroupedByCategory = async () => {
  const categories = await MenuCategoryModel.findAll();

  const result = [];

  for (const category of categories) {
    const items = await MenuItemModel.findAll({
      category_id: category.id,
      is_available: true,
    });

    // Filter by status
    const filteredItems = items.filter(shouldShowItem);
    const itemsEnriched = await Promise.all(filteredItems.map(enrichItem));

    if (itemsEnriched.length > 0) {
      result.push({
        id: category.id,
        name: category.name,
        items: itemsEnriched,
      });
    }
  }

  return result;
};

const getMenuItemDetail = async (id) => {
  const item = await MenuItemModel.findByIdFull(id);

  if (!item || !item.is_available) {
    throw new Error("Món ăn không tồn tại hoặc đang ngừng bán.");
  }

  // Check status - don't show out of stock items
  if (!shouldShowItem(item)) {
    throw new Error("Món ăn đã hết hoặc không khả dụng.");
  }

  // Gắn variants
  const variants = await MenuItemVariantModel.findAvailableByMenuItem(id);
  const is_in_stock = await InventoryModel.checkAvailability(id, 1.0, {
    criticalOnly: true,
  });
  return { ...item, variants, is_in_stock };
};

export const menuPublicService = {
  getPublicMenu,
  getMenuGroupedByCategory,
  getMenuItemDetail,
};
