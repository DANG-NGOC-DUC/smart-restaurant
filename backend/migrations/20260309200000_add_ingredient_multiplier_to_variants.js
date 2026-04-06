/**
 * Thêm cột ingredient_multiplier vào menu_item_variants
 * Hệ số nhân nguyên liệu: size mặc định = 1.0, size lớn > 1, size nhỏ < 1
 */
export const up = (knex) =>
  knex.schema.alterTable("menu_item_variants", (t) => {
    t.decimal("ingredient_multiplier", 5, 2).notNullable().defaultTo(1.0);
  });

export const down = (knex) =>
  knex.schema.alterTable("menu_item_variants", (t) => {
    t.dropColumn("ingredient_multiplier");
  });
