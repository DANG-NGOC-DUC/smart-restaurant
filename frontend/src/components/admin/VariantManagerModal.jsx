import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, GripVertical, Star } from "lucide-react";

export function VariantManagerModal({
  open,
  onOpenChange,
  menuItem,
  variants = [],
  loading,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sync khi mở modal hoặc variants thay đổi
  useEffect(() => {
    if (open) {
      setRows(
        variants.map((v) => ({
          id: v.id,
          label: v.label,
          price_extra: v.price_extra,
          ingredient_multiplier: v.ingredient_multiplier ?? 1,
          is_default: v.is_default,
          is_available: v.is_available,
          sort_order: v.sort_order,
          isNew: false,
          isEdited: false,
        })),
      );
      setError(null);
    }
  }, [open, variants]);

  if (!open) return null;

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: null,
        label: "",
        price_extra: 0,
        ingredient_multiplier: 1,
        is_default: prev.length === 0,
        is_available: true,
        sort_order: prev.length,
        isNew: true,
        isEdited: false,
      },
    ]);
    setError(null);
  };

  const handleRowChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value, isEdited: true };

      // Nếu set default, bỏ default các dòng khác
      if (field === "is_default" && value === true) {
        return updated.map((r, i) => ({
          ...r,
          is_default: i === index,
          isEdited: true,
        }));
      }
      return updated;
    });
    setError(null);
  };

  const handleRemoveRow = async (index) => {
    const row = rows[index];

    // Nếu là dòng mới chưa lưu → xóa luôn khỏi UI
    if (row.isNew) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // Dòng đã tồn tại → confirm rồi xóa từ API
    if (!window.confirm(`Xóa biến thể "${row.label}"?`)) return;
    try {
      await onDelete(menuItem.id, row.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    // Validate
    for (const row of rows) {
      if (!row.label || !row.label.trim()) {
        setError("Tên biến thể không được để trống.");
        return;
      }
      if (row.price_extra === "" || Number(row.price_extra) < 0) {
        setError("Phụ thu phải >= 0 cho tất cả biến thể.");
        return;
      }
      if (
        !row.ingredient_multiplier ||
        Number(row.ingredient_multiplier) <= 0
      ) {
        setError("Hệ số nguyên liệu phải > 0 cho tất cả biến thể.");
        return;
      }
    }

    // Check trùng tên
    const labels = rows.map((r) => r.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) {
      setError("Không được trùng tên biến thể.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const data = {
          label: row.label.trim(),
          price_extra: Number(row.price_extra),
          ingredient_multiplier: Number(row.ingredient_multiplier),
          is_default: row.is_default,
          is_available: row.is_available,
          sort_order: i,
        };

        if (row.isNew) {
          await onCreate(menuItem.id, data);
        } else if (row.isEdited) {
          await onUpdate(menuItem.id, row.id, data);
        }
      }
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sea-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sea-800">
              Quản lý biến thể (Size)
            </h2>
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
              Đang tải biến thể...
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-sea-500 uppercase px-1">
                <div className="col-span-3">Tên biến thể</div>
                <div className="col-span-2">Phụ thu (đ)</div>
                <div className="col-span-2">Hệ số NL</div>
                <div className="col-span-2 text-center">Mặc định</div>
                <div className="col-span-1 text-center">Bật</div>
                <div className="col-span-2"></div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div
                    key={row.id || `new-${idx}`}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border ${
                      row.isNew
                        ? "border-sea-300 bg-sea-50/50"
                        : "border-sea-100"
                    }`}
                  >
                    {/* Label */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) =>
                          handleRowChange(idx, "label", e.target.value)
                        }
                        placeholder="VD: Size Lớn (800g)"
                        className="w-full px-2 py-2 border border-sea-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sea-500"
                      />
                    </div>

                    {/* Price Extra */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={row.price_extra}
                        onChange={(e) =>
                          handleRowChange(idx, "price_extra", e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-2 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                      />
                    </div>

                    {/* Ingredient Multiplier */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={row.ingredient_multiplier}
                        onChange={(e) =>
                          handleRowChange(
                            idx,
                            "ingredient_multiplier",
                            e.target.value,
                          )
                        }
                        placeholder="1.0"
                        className="w-full px-2 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
                      />
                    </div>

                    {/* Is Default */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => handleRowChange(idx, "is_default", true)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          row.is_default
                            ? "bg-amber-100 text-amber-600"
                            : "hover:bg-sea-100 text-sea-300"
                        }`}
                        title={
                          row.is_default
                            ? "Đang là mặc định"
                            : "Đặt làm mặc định"
                        }
                      >
                        <Star
                          className="w-4 h-4"
                          fill={row.is_default ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    {/* Is Available toggle */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() =>
                          handleRowChange(
                            idx,
                            "is_available",
                            !row.is_available,
                          )
                        }
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          row.is_available ? "bg-green-500" : "bg-sea-300"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            row.is_available
                              ? "translate-x-4"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Delete */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1.5 hover:bg-crimson-50 rounded transition-colors"
                        title="Xóa biến thể"
                      >
                        <Trash2 className="w-4 h-4 text-crimson-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add row */}
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 text-sm text-sea-500 hover:text-sea-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm biến thể
              </button>

              {rows.length === 0 && (
                <p className="text-center text-sea-400 text-sm py-4">
                  Chưa có biến thể nào. Thêm để khách hàng có thể chọn size.
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
            {submitting ? "Đang lưu..." : "Lưu biến thể"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VariantManagerModal;
