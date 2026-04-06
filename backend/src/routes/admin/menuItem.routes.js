import express from "express";
import { menuItemController } from "../../controllers/admin/menuItem.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import { upload } from "../../utils/upload.util.js";

const router = express.Router();

// GET /api/admin/menu-items?category_id=...&is_available=true&search=...
router.get("/", auth, allowRoles("admin"), menuItemController.getAllMenuItems);

// GET /api/admin/menu-items/:id
router.get(
  "/:id",
  auth,
  allowRoles("admin"),
  menuItemController.getMenuItemById,
);

// POST /api/admin/menu-items  (multipart/form-data, field "image")
router.post(
  "/",
  auth,
  allowRoles("admin"),
  upload.single("image"),
  menuItemController.createMenuItem,
);

// PUT /api/admin/menu-items/:id  (multipart/form-data, field "image")
router.put(
  "/:id",
  auth,
  allowRoles("admin"),
  upload.single("image"),
  menuItemController.updateMenuItem,
);

// DELETE /api/admin/menu-items/:id
router.delete(
  "/:id",
  auth,
  allowRoles("admin"),
  menuItemController.deleteMenuItem,
);

// POST /api/admin/menu-items/:id/image  (upload ảnh riêng)
router.post(
  "/:id/image",
  auth,
  allowRoles("admin"),
  upload.single("image"),
  menuItemController.uploadImage,
);

// DELETE /api/admin/menu-items/:id/image  (xóa ảnh)
router.delete(
  "/:id/image",
  auth,
  allowRoles("admin"),
  menuItemController.deleteImage,
);

export default router;
