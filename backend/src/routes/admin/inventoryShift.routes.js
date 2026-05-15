import express from "express";
import { inventoryShiftController } from "../../controllers/admin/inventoryShift.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth, allowRoles("admin"));

// GET /api/admin/inventory-shifts/open
router.get("/open", inventoryShiftController.getOpenShift);

// GET /api/admin/inventory-shifts/:shiftId
router.get("/:shiftId", inventoryShiftController.getShiftById);

// POST /api/admin/inventory-shifts
router.post("/", inventoryShiftController.startShift);

// POST /api/admin/inventory-shifts/:shiftId/close
router.post("/:shiftId/close", inventoryShiftController.closeShift);

export default router;
