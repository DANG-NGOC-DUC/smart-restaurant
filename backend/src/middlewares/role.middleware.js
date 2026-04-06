import { UserModel } from "../models/user.model.js";

export const allowRoles = (...roles) => {
  return async (req, res, next) => {
    let role = req.user?.user_metadata?.role;

    // Nếu không có role trong metadata, lấy từ DB
    if (!role) {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({ message: "User ID not found" });
      }
      try {
        const userDb = await UserModel.findById(userId);
        role = userDb?.role;
      } catch (err) {
        return res.status(500).json({ message: "Error fetching user from DB" });
      }
    }

    if (!role) {
      return res.status(403).json({ message: "User role not found" });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
