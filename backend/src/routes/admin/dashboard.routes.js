import express from "express";
import { dashboardController } from "../../controllers/admin/dashboard.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth, allowRoles("admin"));

// GET /api/admin/dashboard/stats
router.get("/stats", dashboardController.getStats);

// GET /api/admin/dashboard/weekly-revenue
router.get("/weekly-revenue", dashboardController.getWeeklyRevenue);

// GET /api/admin/dashboard/top-dishes
router.get("/top-dishes", dashboardController.getTopDishes);

// GET /api/admin/dashboard/recent-orders
router.get("/recent-orders", dashboardController.getRecentOrders);

export default router;
