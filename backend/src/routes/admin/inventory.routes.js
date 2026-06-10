import express from "express";
import { inventoryController } from "../../controllers/admin/inventory.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth);

// GET /api/admin/inventory
router.get("/", allowRoles("admin", "chef"), inventoryController.getAllInventory);

// GET /api/admin/inventory/low-stock
router.get("/low-stock", allowRoles("admin", "chef"), inventoryController.getLowStock);

// POST /api/admin/inventory/:ingredientId/add
router.post("/:ingredientId/add", allowRoles("admin"), inventoryController.addStock);

// POST /api/admin/inventory/:ingredientId/set
router.post("/:ingredientId/set", allowRoles("admin"), inventoryController.setStock);

export default router;
