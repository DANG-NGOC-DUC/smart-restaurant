import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ROLES_OPTIONS = [
  { label: "Khách", value: "guest" },
  { label: "Nhân viên", value: "staff" },
  { label: "Thu ngân", value: "cashier" },
  { label: "Quản lý", value: "admin" },
];

const STATUS_OPTIONS = [
  { label: "Hoạt động", value: "active" },
  { label: "Ngưng hoạt động", value: "inactive" },
  { label: "Bị khóa", value: "blocked" },
];

export function UserDetailsModal({
  open,
  onOpenChange,
  user,
  onUpdate,
  mode = "edit",
}) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "guest",
    status: "active",
    employee_code: "",
    joined_at: "",
    password: "", // <-- Thêm
  });

  useEffect(() => {
    if (open) {
      if (mode === "create") {
        // Reset form cho tạo mới
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          role: "guest",
          status: "active",
          employee_code: "",
          joined_at: "",
          password: "", // <-- Thêm
        });
      } else if (user) {
        // Load data cho edit
        setFormData({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "guest",
          status: user.status || "active",
          employee_code: user.employee_code || "",
          joined_at: user.joined_at ? user.joined_at.split("T")[0] : "",
        });
      }
    }
  }, [user, open, mode]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (onUpdate) {
      // Chỉ gửi những trường có giá trị
      const dataToSend = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          dataToSend[key] = formData[key];
        }
      });
      onUpdate(dataToSend);
    }
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sea-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[425px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sea-100">
          <div>
            <h2 className="text-lg font-semibold text-sea-800">
              {mode === "create"
                ? "Thêm người dùng mới"
                : "Chi tiết người dùng"}
            </h2>
            <p className="text-sm text-sea-500">
              Xem và chỉnh sửa thông tin nhân viên
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-sea-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-sea-400" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleUpdate}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Họ tên */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-sea-700">
              Họ và tên <span className="text-crimson-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email & Phone - 2 cột */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sea-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sea-700">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="0123456789"
                className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 transition-all"
              />
            </div>
          </div>

          {/* Role & Status - 2 cột */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sea-700">
                Vai trò
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sea-500 transition-all"
              >
                {ROLES_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sea-700">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sea-500 transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thông tin nhân viên - chỉ hiển thị nếu role không phải guest */}
          {formData.role !== "guest" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-sea-100">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-sea-700">
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) =>
                    handleChange("employee_code", e.target.value)
                  }
                  placeholder="NV001"
                  className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-sea-700">
                  Ngày vào làm
                </label>
                <input
                  type="date"
                  value={formData.joined_at}
                  onChange={(e) => handleChange("joined_at", e.target.value)}
                  className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Input password (chỉ hiển thị khi mode = create, đặt sau input phone) */}
          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sea-700">
                Mật khẩu <span className="text-crimson-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 border border-sea-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 transition-all"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sea-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-sea-700 bg-white border border-sea-200 rounded-lg hover:bg-sea-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-sea-500 rounded-lg hover:bg-sea-600 shadow-sm shadow-sea-200 transition-colors"
            >
              {mode === "create" ? "Tạo mới" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
