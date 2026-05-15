import knex from "../../db/knex.js";
import crypto from "crypto";
import {
  refreshAvailabilityByIngredients,
} from "../shared/menuAvailability.service.js";

const getShiftItems = async (shiftId) => {
  return knex("inventory_shift_items as isi")
    .join("ingredients as ing", "ing.id", "isi.ingredient_id")
    .where("isi.shift_id", shiftId)
    .select(
      "isi.id",
      "isi.shift_id",
      "isi.ingredient_id",
      "isi.opening_stock",
      "isi.closing_stock",
      "isi.consumed",
      "isi.created_at",
      "isi.updated_at",
      "ing.name as ingredient_name",
      "ing.unit",
    )
    .orderBy("ing.name", "asc");
};

const getShiftById = async (shiftId) => {
  const shift = await knex("inventory_shifts").where({ id: shiftId }).first();
  if (!shift) return null;

  const items = await getShiftItems(shiftId);
  return { ...shift, items };
};

const getOpenShift = async () => {
  const shift = await knex("inventory_shifts")
    .where({ status: "open" })
    .orderBy("opened_at", "desc")
    .first();

  if (!shift) return null;
  return getShiftById(shift.id);
};

const startShift = async ({ name, ingredient_ids, opened_by }) => {
  const existing = await knex("inventory_shifts")
    .where({ status: "open" })
    .first();
  if (existing) {
    throw new Error("Đang có ca kiểm kê mở. Vui lòng đóng ca trước.");
  }

  const hasFilter = Array.isArray(ingredient_ids) && ingredient_ids.length > 0;

  const ingredientsQuery = knex("ingredients as ing")
    .leftJoin("inventory as inv", "inv.ingredient_id", "ing.id")
    .select("ing.id", "inv.current_stock")
    .orderBy("ing.name", "asc");

  if (hasFilter) {
    ingredientsQuery.whereIn("ing.id", ingredient_ids);
  }

  const ingredients = await ingredientsQuery;
  if (ingredients.length === 0) {
    throw new Error("Danh sách nguyên liệu không hợp lệ.");
  }

  return knex.transaction(async (trx) => {
    const [shift] = await trx("inventory_shifts")
      .insert({
        id: crypto.randomUUID(),
        name: name || null,
        status: "open",
        opened_at: knex.fn.now(),
        opened_by: opened_by || null,
      })
      .returning("*");

    const rows = ingredients.map((ing) => ({
      id: crypto.randomUUID(),
      shift_id: shift.id,
      ingredient_id: ing.id,
      opening_stock:
        ing.current_stock === null ? 0 : parseFloat(ing.current_stock),
    }));

    await trx("inventory_shift_items").insert(rows);

    const items = await trx("inventory_shift_items as isi")
      .join("ingredients as ing", "ing.id", "isi.ingredient_id")
      .where("isi.shift_id", shift.id)
      .select(
        "isi.id",
        "isi.shift_id",
        "isi.ingredient_id",
        "isi.opening_stock",
        "isi.closing_stock",
        "isi.consumed",
        "isi.created_at",
        "isi.updated_at",
        "ing.name as ingredient_name",
        "ing.unit",
      )
      .orderBy("ing.name", "asc");

    return { ...shift, items };
  });
};

const closeShift = async ({ shiftId, items, closed_by }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách tồn cuối ca không được rỗng.");
  }

  const closingMap = new Map();
  for (const item of items) {
    if (!item.ingredient_id) {
      throw new Error("Mỗi dòng phải có ingredient_id.");
    }
    if (item.closing_stock === undefined || item.closing_stock < 0) {
      throw new Error("closing_stock phải >= 0.");
    }
    closingMap.set(item.ingredient_id, parseFloat(item.closing_stock));
  }

  return knex.transaction(async (trx) => {
    const shift = await trx("inventory_shifts").where({ id: shiftId }).first();
    if (!shift) {
      throw new Error("Ca kiểm kê không tồn tại.");
    }
    if (shift.status !== "open") {
      throw new Error("Ca kiểm kê đã đóng.");
    }

    const shiftItems = await trx("inventory_shift_items")
      .where({ shift_id: shiftId })
      .select("id", "ingredient_id", "opening_stock");

    if (shiftItems.length !== closingMap.size) {
      throw new Error("Cần nhập tồn cuối ca cho tất cả nguyên liệu.");
    }

    for (const si of shiftItems) {
      if (!closingMap.has(si.ingredient_id)) {
        throw new Error("Thiếu tồn cuối ca cho một hoặc nhiều nguyên liệu.");
      }
    }

    const ingredientIds = [];
    for (const si of shiftItems) {
      const closing = closingMap.get(si.ingredient_id);
      const opening = parseFloat(si.opening_stock) || 0;
      const consumed = opening - closing;
      ingredientIds.push(si.ingredient_id);

      await trx("inventory_shift_items")
        .where({ id: si.id })
        .update({
          closing_stock: closing,
          consumed,
          updated_at: trx.fn.now(),
        });

      const [updatedInv] = await trx("inventory")
        .where({ ingredient_id: si.ingredient_id })
        .update({ current_stock: closing, last_updated: trx.fn.now() });

      if (!updatedInv) {
        await trx("inventory").insert({
          ingredient_id: si.ingredient_id,
          current_stock: closing,
          last_updated: trx.fn.now(),
        });
      }
    }

    await refreshAvailabilityByIngredients(ingredientIds, trx);

    const [updatedShift] = await trx("inventory_shifts")
      .where({ id: shiftId })
      .update({
        status: "closed",
        closed_at: trx.fn.now(),
        closed_by: closed_by || null,
      })
      .returning("*");

    const itemsResult = await trx("inventory_shift_items as isi")
      .join("ingredients as ing", "ing.id", "isi.ingredient_id")
      .where("isi.shift_id", shiftId)
      .select(
        "isi.id",
        "isi.shift_id",
        "isi.ingredient_id",
        "isi.opening_stock",
        "isi.closing_stock",
        "isi.consumed",
        "isi.created_at",
        "isi.updated_at",
        "ing.name as ingredient_name",
        "ing.unit",
      )
      .orderBy("ing.name", "asc");

    return { ...updatedShift, items: itemsResult };
  });
};

export const inventoryShiftService = {
  getShiftById,
  getOpenShift,
  startShift,
  closeShift,
};
