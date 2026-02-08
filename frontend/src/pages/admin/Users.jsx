import React, { useState } from "react";
import { useAdminUsers } from "../../hooks/admin/user";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  BadgeCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { UserDetailsModal } from "../../components/admin/UserDetailsModal";

const roles = [
  { label: "Tất cả", value: "Tat ca" },
  { label: "Khách", value: "guest" },
  { label: "Nhân viên", value: "staff" },
  { label: "Thu ngân", value: "cashier" },
  { label: "Quản lý", value: "admin" },
];

const roleColors = {
  guest: "bg-sea-100 text-sea-700",
  staff: "bg-gold-100 text-gold-700",
  cashier: "bg-coral-100 text-coral-700",
  admin: "bg-crimson-100 text-crimson-700",
};

const statusColors = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gold-100 text-gold-700",
  blocked: "bg-crimson-100 text-crimson-700",
};

const statusLabels = {
  active: "Hoạt động",
  inactive: "Ngưng",
  blocked: "Bị khóa",
};

function Users() {
  const [selectedRole, setSelectedRole] = useState("Tat ca");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    users = [],
    pagination,
    loading,
    error,
    refetch,
    updateUser,
    deleteUser,
    createUser,
    goToPage,
  } = useAdminUsers();

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredUsers = users.filter((user) => {
    const matchRole = selectedRole === "Tat ca" || user.role === selectedRole;
    const email = user.email || "";
    const phone = user.phone || "";
    const fullName = user.full_name || "";
    const employeeCode = user.employee_code || "";
    const matchSearch =
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.id && String(user.id).includes(searchQuery));
    return matchRole && matchSearch;
  });

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (!user) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await deleteUser(user.id);
        showToast("success", "Xóa người dùng thành công!");
      } catch (err) {
        const msg = err?.response?.data?.error || "Lỗi khi xóa người dùng.";
        showToast("error", msg);
      }
    }
  };

  const handleUpdateUser = async (updatedData) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, updatedData);
      showToast("success", "Cập nhật người dùng thành công!");
      setIsModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi khi cập nhật người dùng.";
      showToast("error", msg);
    }
  };

  const handleCreateUser = async (newUserData) => {
    try {
      await createUser(newUserData);
      showToast("success", "Tạo người dùng thành công!");
      setIsCreateModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "Lỗi khi tạo người dùng.";
      showToast("error", msg);
    }
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-cream-100/50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">
            Quản lý Người dùng
          </h1>
          <p className="text-sea-500">
            Danh sách và thông tin người dùng trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 shadow-sm shadow-sea-200 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100/60">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:ring-2 focus:ring-sea-500/20 focus:border-sea-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedRole === role.value
                    ? "bg-sea-500 text-white shadow-md shadow-sea-200"
                    : "bg-sea-50 text-sea-600 hover:bg-sea-100"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-card border border-sea-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sea-50/80 border-b border-sea-100">
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-sea-600">
                  Thông tin
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-sea-600">
                  Liên hệ
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-sea-600">
                  Vai trò
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-sea-600">
                  Trạng thái
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-sea-600 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sea-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sea-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <User className="w-10 h-10 text-sea-200 mx-auto mb-2" />
                    <p className="text-sea-400 text-sm">
                      Không tìm thấy kết quả nào
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-sea-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sea-400 to-sea-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.full_name
                            ? user.full_name.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <p className="font-medium text-sea-800">
                            {user.full_name || "Chưa cập nhật"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-sea-400">
                            {user.employee_code && (
                              <span className="flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" />
                                {user.employee_code}
                              </span>
                            )}
                            {user.joined_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(user.joined_at).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-sea-700">
                          <Phone className="w-3.5 h-3.5 text-sea-400" />
                          {user.phone || "---"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-sea-500">
                          <Mail className="w-3.5 h-3.5 text-sea-400" />
                          {user.email || "---"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${roleColors[user.role] || "bg-sea-100 text-sea-500"}`}
                      >
                        {roles.find((r) => r.value === user.role)?.label ||
                          user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${statusColors[user.status] || "bg-sea-100 text-sea-500"}`}
                      >
                        {statusLabels[user.status] || user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-sea-400 hover:text-sea-600 hover:bg-sea-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-sea-400 hover:text-crimson-500 hover:bg-crimson-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Không cần import UI, chỉ cần import component đã sửa */}
      <UserDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        user={editingUser}
        onUpdate={handleUpdateUser}
        mode="edit"
      />

      {/* Modal Create */}
      <UserDetailsModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        user={null}
        onUpdate={handleCreateUser}
        mode="create"
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl px-6 py-4 shadow-card border border-sea-100/60">
          <p className="text-sm text-sea-500">
            Hiển thị{" "}
            <span className="font-medium text-sea-700">
              {(pagination.page - 1) * pagination.pageSize + 1}
            </span>
            {" - "}
            <span className="font-medium text-sea-700">
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total,
              )}
            </span>
            {" / "}
            <span className="font-medium text-sea-700">
              {pagination.total}
            </span>{" "}
            người dùng
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg text-sea-500 hover:bg-sea-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    p === pagination.page
                      ? "bg-sea-500 text-white shadow-md shadow-sea-200"
                      : "text-sea-600 hover:bg-sea-50"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg text-sea-500 hover:bg-sea-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
