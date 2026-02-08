import { UserModel } from "../../models/user.model.js";
import db from "../../db/knex.js";
import { supabaseAdmin } from "../../config/supabase.js";

const ALLOWED_ROLES = ["guest", "staff", "cashier", "admin"];

/**
 * Cập nhật toàn bộ thông tin người dùng (email, phone, role).
 * @param {string} userId - ID của người dùng cần cập nhật.
 * @param {object} data - Dữ liệu cập nhật (email, phone, role).
 * @returns {Promise<object|null>} Đối tượng người dùng đã được cập nhật hoặc null nếu không tìm thấy.
 */
const updateUser = async (userId, data, currentAdminId) => {
  // Chống admin tự đổi role/status của chính mình
  if (currentAdminId && userId === currentAdminId) {
    if (data.role && data.role !== "admin") {
      throw new Error("Không thể thay đổi vai trò của chính mình.");
    }
    if (data.status && data.status !== "active") {
      throw new Error("Không thể vô hiệu hóa tài khoản của chính mình.");
    }
  }

  if (data.role && !ALLOWED_ROLES.includes(data.role)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(", ")}`,
    );
  }

  // Sync email với Supabase Auth nếu email thay đổi
  if (data.email) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: data.email,
    });
    if (error) throw new Error(`Lỗi đồng bộ Supabase: ${error.message}`);
  }

  const updated = await UserModel.update(userId, data);
  return updated || null;
};

const getAllUsers = async ({ page = 1, pageSize = 20 } = {}) => {
  const fields = [
    "id",
    "full_name",
    "email",
    "phone",
    "role",
    "status",
    "employee_code",
    "joined_at",
    "created_at",
  ];
  const [users, total] = await Promise.all([
    UserModel.findAll(fields, page, pageSize),
    UserModel.count(),
  ]);
  return {
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const deleteUser = async (userId, currentAdminId) => {
  // Chống admin tự xóa chính mình
  if (currentAdminId && userId === currentAdminId) {
    throw new Error("Không thể xóa tài khoản của chính mình.");
  }

  // Xóa user trên Supabase Auth trước
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`Lỗi xóa Supabase: ${error.message}`);

  // Xóa trong DB local
  return (await UserModel.delete(userId)) > 0;
};

const getUserById = async (userId) => {
  return UserModel.findById(userId);
};

const createUser = async (data) => {
  const {
    full_name,
    email,
    phone,
    role,
    status,
    employee_code,
    joined_at,
    password,
  } = data;
  if (role && !ALLOWED_ROLES.includes(role)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(", ")}`,
    );
  }
  if (email) {
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new Error("Email already exists.");
    }
  }
  if (phone) {
    const existingPhone = await UserModel.findByPhone(phone);
    if (existingPhone) {
      throw new Error("Phone number already exists.");
    }
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password || "Hello1234567",
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        phone: phone,
      },
    });

  if (authError) {
    throw new Error(`Supabase auth error: ${authError.message}`);
  }

  const newUser = {
    id: authData.user.id,
    full_name,
    email,
    phone,
    role: role || "guest",
    status: status || "active",
    employee_code: employee_code || null,
    joined_at: joined_at || null,
  };

  // Insert vào bảng users
  const createdUser = await UserModel.create(newUser);
  return createdUser;
};

export const userManagementService = {
  updateUser,
  getAllUsers,
  deleteUser,
  getUserById,
  createUser,
};
