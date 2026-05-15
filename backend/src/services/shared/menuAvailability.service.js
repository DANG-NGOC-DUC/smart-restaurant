import knex from "../../db/knex.js";

const getCriticalAvailability = async (menuItemId, trx = knex) => {
  const rows = await trx("menu_item_ingredients as mii")
    .leftJoin("inventory as inv", "inv.ingredient_id", "mii.ingredient_id")
    .where("mii.menu_item_id", menuItemId)
    .andWhere("mii.is_critical", true)
    .select("mii.quantity_needed", "inv.current_stock");

  if (rows.length === 0) return true;

  return rows.every((row) => {
    const stock = row.current_stock === null ? 0 : row.current_stock;
    return parseFloat(stock) >= parseFloat(row.quantity_needed);
  });
};

const refreshAvailabilityForMenuItems = async (menuItemIds, trx = knex) => {
  const ids = Array.from(new Set((menuItemIds || []).filter(Boolean)));
  if (ids.length === 0) return [];

  const menuItems = await trx("menu_items")
    .whereIn("id", ids)
    .select("id", "is_available", "auto_locked");

  const updates = [];
  for (const item of menuItems) {
    const isAvailable = await getCriticalAvailability(item.id, trx);

    if (!isAvailable) {
      if (!item.is_available && !item.auto_locked) {
        continue;
      }
      const [updated] = await trx("menu_items")
        .where({ id: item.id })
        .update({ is_available: false, auto_locked: true })
        .returning("*");
      if (updated) updates.push(updated);
      continue;
    }

    if (item.auto_locked) {
      const [updated] = await trx("menu_items")
        .where({ id: item.id })
        .update({ is_available: true, auto_locked: false })
        .returning("*");
      if (updated) updates.push(updated);
    }
  }

  return updates;
};

const refreshAvailabilityByIngredients = async (ingredientIds, trx = knex) => {
  const ids = Array.from(new Set((ingredientIds || []).filter(Boolean)));
  if (ids.length === 0) return [];

  const rows = await trx("menu_item_ingredients")
    .whereIn("ingredient_id", ids)
    .andWhere("is_critical", true)
    .distinct("menu_item_id");

  const menuItemIds = rows.map((row) => row.menu_item_id);
  return refreshAvailabilityForMenuItems(menuItemIds, trx);
};

export {
  getCriticalAvailability,
  refreshAvailabilityForMenuItems,
  refreshAvailabilityByIngredients,
};
