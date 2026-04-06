import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export function TableFormModal({
  open,
  onOpenChange,
  table,
  onSubmit,
  mode = "create", // "create" | "edit"
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    capacity: 4,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormError(null);
      if (mode === "edit" && table) {
        setFormData({
          name: table.name || "",
          code: table.code || "",
          capacity: table.capacity || 4,
          is_active: table.is_active !== undefined ? table.is_active : true,
        });
      } else {
        setFormData({ name: "", code: "", capacity: 4, is_active: true });
      }
    }
  }, [open, table, mode]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Tên bàn không được để trống.");
      return;
    }
    if (!formData.code.trim()) {
      setFormError("Mã bàn không được để trống.");
      return;
    }
    if (!formData.capacity || formData.capacity <= 0) {
      setFormError("Sức chứa phải lớn hơn 0.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        code: formData.code.trim(),
        capacity: Number(formData.capacity),
        is_active: formData.is_active,
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
            {mode === "create" ? "Thêm bàn mới" : "Chỉnh sửa bàn"}
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

          {/* Tên bàn */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Tên bàn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Bàn 1, Bàn VIP 3..."
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Mã bàn */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Mã bàn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="VD: B01, VIP01..."
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Sức chứa */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Sức chứa (số ghế) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sea-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sea-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sea-500"></div>
            </label>
            <span className="text-sm font-medium text-sea-700">
              {formData.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
            </span>
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
                  ? "Tạo bàn"
                  : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableFormModal;
