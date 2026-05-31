import knex from "../db/knex.js";
import { UserModel } from "../models/user.model.js";

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({ message: "User ID not found" });
      }

      let role = req.user?.role || req.user?.user_metadata?.role;

      if (!role) {
        const userDb = await UserModel.findById(userId);
        role = userDb?.role;
      }

      if (!role) {
        return res.status(403).json({ message: "User role not found" });
      }

      req.user.role = role;
      req.user.user_metadata = { ...req.user.user_metadata, role };

      if (role === "admin") {
        return next();
      }

      const permissionRow = await knex("permissions as p")
        .leftJoin("role_permissions as rp", "rp.permission_id", "p.id")
        .leftJoin("user_permissions as up", "up.permission_id", "p.id")
        .where("p.key", permissionKey)
        .andWhere((qb) => {
          qb.where("rp.role", role).orWhere("up.user_id", userId);
        })
        .first();

      if (!permissionRow) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient permission" });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
};
