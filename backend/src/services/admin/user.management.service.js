import { UserModel } from "../../models/user.model.js";
import { supabaseAdmin } from "../../config/supabase.js";
import knex from "../../db/knex.js";

const ALLOWED_ROLES = ["staff", "chef", "admin"];
const STAFF_ROLES = ["admin", "staff", "chef"];
const GUEST_ROLES = ["guest"];

const getUserPermissionKeys = async (userId) => {
  const rows = await knex("user_permissions as up")
    .join("permissions as p", "p.id", "up.permission_id")
    .where("up.user_id", userId)
    .select("p.key");
  return rows.map((row) => row.key);
};

const getUserPermissionsMap = async (userIds) => {
  if (!userIds || userIds.length === 0) return {};
  const rows = await knex("user_permissions as up")
    .join("permissions as p", "p.id", "up.permission_id")
    .whereIn("up.user_id", userIds)
    .select("up.user_id", "p.key");

  return rows.reduce((acc, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = [];
    acc[row.user_id].push(row.key);
    return acc;
  }, {});
};

const setUserPermissions = async (userId, permissionKeys, grantedBy) => {
  if (!Array.isArray(permissionKeys)) return;
  const keys = permissionKeys.filter(Boolean);

  await knex.transaction(async (trx) => {
    await trx("user_permissions").where({ user_id: userId }).del();

    if (keys.length === 0) return;

    const permissions = await trx("permissions")
      .whereIn("key", keys)
      .select("id");

    if (permissions.length === 0) return;

    const rows = permissions.map((permission) => ({
      user_id: userId,
      permission_id: permission.id,
      granted_by: grantedBy || null,
    }));

    await trx("user_permissions")
      .insert(rows)
      .onConflict(["user_id", "permission_id"])
      .ignore();
  });
};

/**
 * Cập nhật toàn bộ thông tin người dùng (email, phone, role).
 * @param {string} userId - ID của người dùng cần cập nhật.
 * @param {object} data - Dữ liệu cập nhật (email, phone, role).
 * @returns {Promise<object|null>} Đối tượng người dùng đã được cập nhật hoặc null nếu không tìm thấy.
 */
const updateUser = async (userId, data, currentAdminId) => {
  const { permissions, ...userData } = data;

  // Chống admin tự đổi role/status của chính mình
  if (currentAdminId && userId === currentAdminId) {
    if (userData.role && userData.role !== "admin") {
      throw new Error("Không thể thay đổi vai trò của chính mình.");
    }
    if (userData.status && userData.status !== "active") {
      throw new Error("Không thể vô hiệu hóa tài khoản của chính mình.");
    }
  }

  if (userData.role && !ALLOWED_ROLES.includes(userData.role)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(", ")}`,
    );
  }

  // Sync email với Supabase Auth nếu email thay đổi
  if (userData.email) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: userData.email,
    });
    if (error) throw new Error(`Lỗi đồng bộ Supabase: ${error.message}`);
  }

  let updated = null;
  if (Object.keys(userData).length > 0) {
    updated = await UserModel.update(userId, userData);
  } else {
    updated = await UserModel.findById(userId);
  }

  if (Array.isArray(permissions)) {
    await setUserPermissions(userId, permissions, currentAdminId);
  }

  if (!updated) return null;

  const permissionKeys = await getUserPermissionKeys(userId);
  return { ...updated, permissions: permissionKeys };
};

const getAllUsers = async ({
  page = 1,
  pageSize = 20,
  type = "staff",
} = {}) => {
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
  const roles = type === "guest" ? GUEST_ROLES : STAFF_ROLES;
  const [users, total] = await Promise.all([
    UserModel.findAll(fields, page, pageSize, roles),
    UserModel.count(roles),
  ]);

  const permissionMap = await getUserPermissionsMap(users.map((u) => u.id));
  const usersWithPermissions = users.map((user) => ({
    ...user,
    permissions: permissionMap[user.id] || [],
  }));
  return {
    users: usersWithPermissions,
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
  const user = await UserModel.findById(userId);
  if (!user) return null;
  const permissions = await getUserPermissionKeys(userId);
  return { ...user, permissions };
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
    permissions,
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
  if (Array.isArray(permissions)) {
    await setUserPermissions(createdUser.id, permissions, null);
  }
  const permissionKeys = await getUserPermissionKeys(createdUser.id);
  return { ...createdUser, permissions: permissionKeys };
};

export const userManagementService = {
  updateUser,
  getAllUsers,
  deleteUser,
  getUserById,
  createUser,
};
