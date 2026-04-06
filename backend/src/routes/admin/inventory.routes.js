import express from "express";
import { inventoryController } from "../../controllers/admin/inventory.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth, allowRoles("admin"));

// GET /api/admin/inventory
router.get("/", inventoryController.getAllInventory);

// GET /api/admin/inventory/low-stock
router.get("/low-stock", inventoryController.getLowStock);

// POST /api/admin/inventory/:ingredientId/add
router.post("/:ingredientId/add", inventoryController.addStock);

// POST /api/admin/inventory/:ingredientId/set
router.post("/:ingredientId/set", inventoryController.setStock);

export default router;
