import { userManagementService } from "../../services/admin/user.management.service.js";

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const result = await userManagementService.getAllUsers({ page, pageSize });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentAdminId = req.user?.id;
    const deleted = await userManagementService.deleteUser(
      userId,
      currentAdminId,
    );

    if (!deleted) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    if (
      error.message.includes("Không thể") ||
      error.message.includes("Supabase")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userManagementService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const allowedFields = [
      "full_name",
      "email",
      "phone",
      "role",
      "status",
      "employee_code",
      "joined_at",
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }
    const updatedUser = await userManagementService.updateUser(
      userId,
      updateData,
      req.user?.id,
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    if (
      error.message.startsWith("Invalid role") ||
      error.message.includes("Không thể") ||
      error.message.includes("Supabase")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.email) {
      return res.status(400).json({ error: "Email là bắt buộc." });
    }
    if (!data.full_name) {
      return res.status(400).json({ error: "Họ tên là bắt buộc." });
    }
    const newUser = await userManagementService.createUser(data);
    res.status(201).json(newUser);
  } catch (error) {
    if (
      error.message.includes("already exists") ||
      error.message.includes("Invalid role") ||
      error.message.includes("Supabase")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const userManagementController = {
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  createUser,
};
