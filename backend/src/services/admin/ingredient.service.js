import knex from "../../db/knex.js";
import { IngredientModel } from "../../models/ingredient.model.js";
import {
  refreshAvailabilityByIngredients,
} from "../shared/menuAvailability.service.js";

const getAllIngredients = async () => {
  return IngredientModel.findAll();
};

const getIngredientById = async (id) => {
  return IngredientModel.findById(id);
};

const createIngredient = async (data) => {
  const { name, unit, min_stock } = data;

  const normalizedUnit = normalizeUnit(unit);

  if (!name || !normalizedUnit) {
    throw new Error("Tên và đơn vị là bắt buộc.");
  }

  // Kiểm tra trùng tên
  const existing = await IngredientModel.findByName(name.trim());
  if (existing) {
    throw new Error("Nguyên liệu này đã tồn tại.");
  }

  return IngredientModel.create({
    name: name.trim(),
    unit: normalizedUnit,
    min_stock: min_stock || 0,
  });
};

const updateIngredient = async (id, data) => {
  const ingredient = await IngredientModel.findById(id);
  if (!ingredient) return null;

  // Nếu đổi tên → kiểm tra trùng
  if (data.name && data.name.trim() !== ingredient.name) {
    const existing = await IngredientModel.findByName(data.name.trim());
    if (existing) {
      throw new Error("Tên nguyên liệu đã tồn tại.");
    }
    data.name = data.name.trim();
  }

  if (data.unit) data.unit = normalizeUnit(data.unit);

  return IngredientModel.update(id, data);
};

const deleteIngredient = async (id) => {
  const ingredient = await IngredientModel.findById(id);
  if (!ingredient) return null;

  const deleted = await IngredientModel.remove(id);
  return deleted > 0;
};

const getRelatedDishes = async (ingredientId) => {
  const { MenuItemIngredientModel } =
    await import("../../models/menuItemIngredient.model.js");
  return MenuItemIngredientModel.findByIngredientId(ingredientId);
};

const normalizeName = (name) =>
  typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";

const UNIT_ALIASES = {
  kg: ["kg", "kilo", "kilogram", "kí", "ky", "ki", "cân", "can"],
  g: ["g", "gram", "gam"],
  "lít": ["l", "lit", "lít", "litre", "liter"],
  ml: ["ml", "milliliter", "mililiter"],
  chai: ["chai", "bottle"],
  hộp: ["hộp", "hop", "box"],
  gói: ["gói", "goi", "pack"],
  quả: ["quả", "qua"],
  con: ["con"],
  bó: ["bó", "bo"],
  miếng: ["miếng", "mieng"],
  lá: ["lá", "la"],
  muỗng: ["muỗng", "muong"],
};

const normalizeUnit = (unit) => {
  const raw = typeof unit === "string" ? unit.trim().toLowerCase() : "";
  if (!raw) return "";
  for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.includes(raw)) return canonical;
  }
  return raw;
};

const parseQuantity = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, ".").replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};

const findIngredientByNameInsensitive = async (name, trx) => {
  if (!name) return null;
  return trx("ingredients")
    .whereRaw("LOWER(name) = LOWER(?)", [name])
    .first();
};

const bulkUpsertIngredients = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách nguyên liệu rỗng.");
  }

  return knex.transaction(async (trx) => {
    const results = [];
    const touchedIngredientIds = new Set();

    for (let index = 0; index < items.length; index += 1) {
      const raw = items[index] || {};
      const name = normalizeName(raw.name);
      const unitInput = normalizeUnit(raw.unit);
      const quantity = parseQuantity(raw.quantity);

      const result = {
        index,
        input: {
          name: raw.name ?? null,
          unit: raw.unit ?? null,
          quantity: raw.quantity ?? null,
          note: raw.note ?? null,
        },
        status: "error",
        errors: [],
        warnings: [],
      };

      if (!name) {
        result.errors.push("Thiếu tên nguyên liệu.");
        results.push(result);
        continue;
      }

      let ingredient = await findIngredientByNameInsensitive(name, trx);
      let created = false;

      if (!ingredient) {
        if (!unitInput) {
          result.errors.push("Thiếu đơn vị cho nguyên liệu mới.");
          results.push(result);
          continue;
        }

        const [createdIngredient] = await trx("ingredients")
          .insert({
            name,
            unit: unitInput,
            min_stock: raw.min_stock || 0,
          })
          .returning("*");

        ingredient = createdIngredient;
        created = true;
      }

      if (
        unitInput &&
        ingredient.unit &&
        unitInput !== ingredient.unit.toLowerCase()
      ) {
        result.warnings.push(
          `Đơn vị nhập khác với hệ thống (${ingredient.unit}).`,
        );
      }

      let stockAdded = null;
      if (quantity !== null && quantity > 0) {
        const existingInventory = await trx("inventory")
          .where({ ingredient_id: ingredient.id })
          .first();

        if (!existingInventory) {
          await trx("inventory").insert({
            ingredient_id: ingredient.id,
            current_stock: quantity,
          });
        } else {
          await trx("inventory")
            .where({ ingredient_id: ingredient.id })
            .update({
              current_stock: trx.raw("current_stock + ?", [quantity]),
              last_updated: trx.fn.now(),
            });
        }

        touchedIngredientIds.add(ingredient.id);
        stockAdded = quantity;
      } else {
        result.warnings.push("Không có số lượng hợp lệ để nhập kho.");
      }

      result.status = created ? "created" : "updated";
      result.ingredient_id = ingredient.id;
      result.name = ingredient.name;
      result.unit = ingredient.unit;
      result.stock_added = stockAdded;

      results.push(result);
    }

    await refreshAvailabilityByIngredients(
      Array.from(touchedIngredientIds),
      trx,
    );

    const summary = results.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "created") acc.created += 1;
        else if (item.status === "updated") acc.updated += 1;
        else acc.errors += 1;
        return acc;
      },
      { total: 0, created: 0, updated: 0, errors: 0 },
    );

    return { results, summary };
  });
};

export const ingredientService = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getRelatedDishes,
  bulkUpsertIngredients,
};
