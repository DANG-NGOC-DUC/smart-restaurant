import db from "../../db/knex.js";

const ALLOWED_ROLES = ["guest", "staff", "cashier", "admin"];

/**
 * Cập nhật vai trò cho một người dùng.
 * @param {string} userId - ID của người dùng cần cập nhật.
 * @param {string} newRole - Vai trò mới cần gán.
 * @returns {Promise<object|null>} Đối tượng người dùng đã được cập nhật hoặc null nếu không tìm thấy.
 */
const updateUserRole = async (userId, newRole) => {
  if (!ALLOWED_ROLES.includes(newRole)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(", ")}`,
    );
  }

  const [updatedUser] = await db("users")
    .where({ id: userId })
    .update({ role: newRole })
    .returning(["id", "email", "role"]); // Trả về thông tin người dùng đã cập nhật

  return updatedUser || null;
};

export const userManagementService = {
  updateUserRole,
};
