import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";

export function RecipeModal({
  open,
  onOpenChange,
  menuItem,
  recipe,
  allIngredients = [],
  loading,
  onSetRecipe,
  onRemoveItem,
}) {
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && recipe) {
      // Load công thức hiện tại
      const current = recipe.ingredients || [];
      setRows(
        current.map((r) => ({
          ingredient_id: r.ingredient_id,
          quantity_needed: r.quantity_needed,
          ingredient_name: r.ingredient_name,
          unit: r.unit,
          is_critical: r.is_critical !== undefined ? r.is_critical : true,
        })),
      );
      setError(null);
    }
  }, [open, recipe]);

  if (!open) return null;

  // Lọc nguyên liệu chưa được thêm vào
  const usedIds = rows.map((r) => r.ingredient_id);
  const availableIngredients = allIngredients.filter(
    (ing) => !usedIds.includes(ing.id),
  );

  const handleAddRow = () => {
    if (availableIngredients.length === 0) return;
    setRows((prev) => [
      ...prev,
      {
        ingredient_id: "",
        quantity_needed: "",
        ingredient_name: "",
        unit: "",
        is_critical: true,
      },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Nếu chọn nguyên liệu mới, tự fill tên + đơn vị
      if (field === "ingredient_id") {
        const ing = allIngredients.find((i) => i.id === value);
        if (ing) {
          updated[index].ingredient_name = ing.name;
          updated[index].unit = ing.unit;
        }
      }
      return updated;
    });
    setError(null);
  };

  const handleRemoveRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validate
    const validRows = rows.filter((r) => r.ingredient_id);
    if (validRows.length === 0) {
      setError("Cần ít nhất 1 nguyên liệu trong công thức.");
      return;
    }

    for (const row of validRows) {
      if (!row.quantity_needed || Number(row.quantity_needed) <= 0) {
        setError("Định lượng phải lớn hơn 0 cho tất cả nguyên liệu.");
        return;
      }
    }

    // Check trùng
    const ids = validRows.map((r) => r.ingredient_id);
    if (new Set(ids).size !== ids.length) {
      setError("Không được trùng nguyên liệu.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSetRecipe(
        menuItem.id,
        validRows.map((r) => ({
          ingredient_id: r.ingredient_id,
          quantity_needed: Number(r.quantity_needed),
          is_critical: r.is_critical !== false,
        })),
      );
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFromRecipe = async (ingredientId) => {
    if (!window.confirm("Xóa nguyên liệu này khỏi công thức?")) return;
    try {
      await onRemoveItem(menuItem.id, ingredientId);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sea-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sea-800">Công thức món ăn</h2>
            <p className="text-sm text-sea-500 mt-0.5">
              {menuItem?.name || ""}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sea-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-sea-400">
              Đang tải công thức...
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-sea-500 uppercase px-1">
                <div className="col-span-4">Nguyên liệu</div>
                <div className="col-span-3">Định lượng</div>
                <div className="col-span-2">Đơn vị</div>
                <div className="col-span-2">Quan trọng</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-4">
                      {row.ingredient_name &&
                      usedIds.filter((id) => id === row.ingredient_id).length <=
                        1 ? (
                        // Nguyên liệu đã chọn
                        <select
                          value={row.ingredient_id}
                          onChange={(e) =>
                            handleRowChange(
                              idx,
                              "ingredient_id",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-2 border border-sea-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sea-500"
                        >
                          <option value="">-- Chọn --</option>
                          {/* Hiện option đang chọn + các option chưa chọn */}
                          {allIngredients
                            .filter(
                              (ing) =>
                                ing.id === row.ingredient_id ||
                                !usedIds.includes(ing.id),
                            )
                            .map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <select
                          value={row.ingredient_id}
                          onChange={(e) =>
                            handleRowChange(
                              idx,
                              "ingredient_id",
                              e.target.value,
                            )
                          }
                          className="w-full px-2 py-2 border border-sea-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sea-500"
                        >
                          <option value="">-- Chọn --</option>
                          {availableIngredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={row.quantity_needed}
                        onChange={(e) =>
                          handleRowChange(
                            idx,
                            "quantity_needed",
                            e.target.value,
                          )
                        }
                        placeholder="0"
                        className="w-full px-2 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-sea-500">
                        {row.unit || "—"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <label className="inline-flex items-center gap-2 text-xs text-sea-600">
                        <input
                          type="checkbox"
                          checked={row.is_critical !== false}
                          onChange={(e) =>
                            handleRowChange(
                              idx,
                              "is_critical",
                              e.target.checked,
                            )
                          }
                          className="accent-sea-500"
                        />
                        {row.is_critical !== false ? "Chính" : "Phụ"}
                      </label>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1.5 hover:bg-crimson-50 rounded transition-colors"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-4 h-4 text-crimson-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thêm dòng */}
              {availableIngredients.length > 0 && (
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-2 text-sm text-sea-500 hover:text-sea-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Thêm nguyên liệu
                </button>
              )}

              {rows.length === 0 && (
                <p className="text-center text-sea-400 text-sm py-4">
                  Chưa có nguyên liệu nào trong công thức
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sea-100 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || loading}
            className="flex-1 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Đang lưu..." : "Lưu công thức"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;
