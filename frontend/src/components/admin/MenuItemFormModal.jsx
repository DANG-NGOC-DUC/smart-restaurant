import React, { useState, useEffect } from "react";
import { X, Upload, ImageIcon } from "lucide-react";

export function MenuItemFormModal({
  open,
  onOpenChange,
  item,
  categories = [],
  onSubmit,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormError(null);
      setImageFile(null);
      if (mode === "edit" && item) {
        setFormData({
          name: item.name || "",
          price: item.price || "",
          category_id: item.category_id || "",
          description: item.description || "",
          is_available:
            item.is_available !== undefined ? item.is_available : true,
        });
        setImagePreview(item.image_url || null);
      } else {
        setFormData({
          name: "",
          price: "",
          category_id: "",
          description: "",
          is_available: true,
        });
        setImagePreview(null);
      }
    }
  }, [open, item, mode]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError("File ảnh không được vượt quá 2MB.");
        return;
      }
      // Revoke URL cũ để tránh memory leak
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Tên món ăn không được để trống.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError("Giá phải lớn hơn 0.");
      return;
    }

    setSubmitting(true);
    try {
      // Tạo FormData cho multipart
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("price", Number(formData.price));
      if (formData.category_id) fd.append("category_id", formData.category_id);
      if (formData.description)
        fd.append("description", formData.description.trim());
      fd.append("is_available", formData.is_available);
      if (imageFile) fd.append("image", imageFile);

      await onSubmit(fd);
      onOpenChange(false);
    } catch (err) {
      setFormError(err.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-sea-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-sea-800">
            {mode === "create" ? "Thêm món mới" : "Chỉnh sửa món"}
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

          {/* Hình ảnh */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Hình ảnh
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-sea-200 flex items-center justify-center overflow-hidden bg-sea-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-sea-300" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-sea-50 text-sea-600 rounded-lg cursor-pointer hover:bg-sea-100 transition-colors text-sm font-medium">
                  <Upload className="w-4 h-4" />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-sea-400 mt-1">
                  JPEG, PNG, WebP. Tối đa 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Tên món */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Tên món ăn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Tôm hùm nướng bơ tỏi"
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Giá & Danh mục */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sea-700 mb-1.5">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sea-700 mb-1.5">
                Danh mục
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                className="w-full px-3 py-2.5 border border-sea-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-sea-700 mb-1.5">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả ngắn về món ăn..."
              rows={3}
              className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => handleChange("is_available", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sea-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sea-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sea-500"></div>
            </label>
            <span className="text-sm font-medium text-sea-700">
              {formData.is_available ? "Còn hàng" : "Hết hàng"}
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
                  ? "Thêm món"
                  : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuItemFormModal;
