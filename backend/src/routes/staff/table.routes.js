import express from "express";
import { tableController } from "../../controllers/admin/table.controller.js";
import { sessionController } from "../../controllers/admin/session.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Staff xem trạng thái bàn
// GET /api/staff/tables/status
router.get(
  "/status",
  auth,
  allowRoles("staff"),
  tableController.getTablesWithStatus,
);

// GET /api/staff/tables/:id/status
router.get(
  "/:id/status",
  auth,
  allowRoles("staff"),
  tableController.getTableStatus,
);

// Staff mở/đóng phiên
// POST /api/staff/tables/:tableId/session/open
router.post(
  "/:tableId/session/open",
  auth,
  allowRoles("staff"),
  sessionController.openSession,
);

// POST /api/staff/tables/:tableId/session/close
router.post(
  "/:tableId/session/close",
  auth,
  allowRoles("staff"),
  sessionController.closeSession,
);

// GET /api/staff/tables/:tableId/session
router.get(
  "/:tableId/session",
  auth,
  allowRoles("staff"),
  sessionController.getActiveSession,
);

export default router;
