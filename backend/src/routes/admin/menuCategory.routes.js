import express from "express";
import { menuCategoryController } from "../../controllers/admin/menuCategory.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// GET /api/admin/menu-categories
router.get(
  "/",
  auth,
  allowRoles("admin"),
  menuCategoryController.getAllCategories,
);

// GET /api/admin/menu-categories/:id
router.get(
  "/:id",
  auth,
  allowRoles("admin"),
  menuCategoryController.getCategoryById,
);

// POST /api/admin/menu-categories
router.post(
  "/",
  auth,
  allowRoles("admin"),
  menuCategoryController.createCategory,
);

// PUT /api/admin/menu-categories/:id
router.put(
  "/:id",
  auth,
  allowRoles("admin"),
  menuCategoryController.updateCategory,
);

// DELETE /api/admin/menu-categories/:id
router.delete(
  "/:id",
  auth,
  allowRoles("admin"),
  menuCategoryController.deleteCategory,
);

export default router;
