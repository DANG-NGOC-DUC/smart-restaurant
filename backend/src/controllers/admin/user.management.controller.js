import { userManagementService } from "../../services/admin/user.management.service.js";

const updateRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "New role is required." });
    }

    const updatedUser = await userManagementService.updateUserRole(userId, role);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    // Bắt lỗi từ service (ví dụ: vai trò không hợp lệ)
    if (error.message.startsWith("Invalid role")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const userManagementController = {
  updateRole,
};
