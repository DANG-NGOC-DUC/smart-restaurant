import express from "express";
import { reportController } from "../../controllers/admin/report.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth, allowRoles("admin"));

// GET /api/admin/reports/summary?range=7days
router.get("/summary", reportController.getSummary);

// GET /api/admin/reports/revenue?range=7days
router.get("/revenue", reportController.getRevenueChart);

// GET /api/admin/reports/top-items?range=7days&limit=10
router.get("/top-items", reportController.getTopItems);

// GET /api/admin/reports/categories?range=7days
router.get("/categories", reportController.getCategoryRevenue);

// GET /api/admin/reports/payment-methods?range=7days
router.get("/payment-methods", reportController.getPaymentMethods);

// GET /api/admin/reports/peak-hours?range=7days
router.get("/peak-hours", reportController.getPeakHours);

export default router;
