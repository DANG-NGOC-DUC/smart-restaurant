import express from "express";
import { reviewController } from "../../controllers/admin/review.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(auth, allowRoles("admin"));

// GET /api/admin/reviews
router.get("/", reviewController.getAll);

// GET /api/admin/reviews/latest
router.get("/latest", reviewController.getLatest);

export default router;
