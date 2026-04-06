import express from "express";
import { tableController } from "../../controllers/admin/table.controller.js";
import { sessionController } from "../../controllers/admin/session.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// === CRUD Bàn (chỉ admin) ===

// GET /api/admin/tables
router.get("/", auth, allowRoles("admin"), tableController.getAllTables);

// GET /api/admin/tables/status
router.get(
  "/status",
  auth,
  allowRoles("admin"),
  tableController.getTablesWithStatus,
);

// GET /api/admin/tables/:id
router.get("/:id", auth, allowRoles("admin"), tableController.getTableById);

// GET /api/admin/tables/:id/status
router.get(
  "/:id/status",
  auth,
  allowRoles("admin"),
  tableController.getTableStatus,
);

// POST /api/admin/tables
router.post("/", auth, allowRoles("admin"), tableController.createTable);

// PUT /api/admin/tables/:id
router.put("/:id", auth, allowRoles("admin"), tableController.updateTable);

// DELETE /api/admin/tables/:id
router.delete("/:id", auth, allowRoles("admin"), tableController.deleteTable);

// === Session (admin cũng có thể mở/đóng phiên) ===

// POST /api/admin/tables/:tableId/session/open
router.post(
  "/:tableId/session/open",
  auth,
  allowRoles("admin"),
  sessionController.openSession,
);

// POST /api/admin/tables/:tableId/session/close
router.post(
  "/:tableId/session/close",
  auth,
  allowRoles("admin"),
  sessionController.closeSession,
);

// GET /api/admin/tables/:tableId/session
router.get(
  "/:tableId/session",
  auth,
  allowRoles("admin"),
  sessionController.getActiveSession,
);

export default router;
