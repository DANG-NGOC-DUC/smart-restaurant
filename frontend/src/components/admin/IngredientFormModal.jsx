import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const UNIT_OPTIONS = [
  "kg",
  "g",
  "lít",
  "ml",
  "quả",
  "con",
  "gói",
  "hộp",
  "chai",
  "bó",
  "miếng",
  "lá",
  "muỗng",
];

export function IngredientFormModal({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormError(null);
      if (mode === "edit" && ingredient) {
        setFormData({
          name: ingredient.name || "",
          unit: ingredient.unit || "",
        });
      } else {
        setFormData({ name: "", unit: "" });
      }
    }
  }, [open, ingredient, mode]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Tên nguyên liệu không được để trống.");
      return;
    }
    if (!formData.unit.trim()) {
      setFormError("Đơn vị không được để trống.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        unit: formData.unit.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      setFormError(err.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-sea-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-sea-800">
            {mode === "create" ? "Thêm nguyên liệu" : "Chỉnh sửa nguyên liệu"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sea-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}

          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Tên nguyên liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Tôm sú, Bơ, Tỏi..."
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Đơn vị */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Đơn vị <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="unit-list"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                placeholder="kg, g, lít..."
                className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
              />
              <datalist id="unit-list">
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-sea-500 text-white rounded-lg font-medium hover:bg-sea-600 transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Đang xử lý..."
                : mode === "create"
                  ? "Thêm"
                  : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IngredientFormModal;
