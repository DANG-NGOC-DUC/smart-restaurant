import express from "express";
import { menuItemVariantController } from "../../controllers/admin/menuItemVariant.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// GET /api/admin/menu-items/:menuItemId/variants
router.get(
  "/:menuItemId/variants",
  auth,
  allowRoles("admin"),
  menuItemVariantController.getVariants,
);

// POST /api/admin/menu-items/:menuItemId/variants
router.post(
  "/:menuItemId/variants",
  auth,
  allowRoles("admin"),
  menuItemVariantController.createVariant,
);

// PUT /api/admin/menu-items/variants/:id
router.put(
  "/variants/:id",
  auth,
  allowRoles("admin"),
  menuItemVariantController.updateVariant,
);

// DELETE /api/admin/menu-items/variants/:id
router.delete(
  "/variants/:id",
  auth,
  allowRoles("admin"),
  menuItemVariantController.deleteVariant,
);

export default router;
