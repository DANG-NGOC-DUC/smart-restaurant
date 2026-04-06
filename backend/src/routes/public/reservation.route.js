import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import {
  createReservation,
  getMyReservations,
  cancelReservation,
} from "../../controllers/public/reservation.controller.js";

const router = express.Router();

// Tất cả reservation routes cần đăng nhập
router.post("/", auth, createReservation);
router.get("/my", auth, getMyReservations);
router.patch("/:id/cancel", auth, cancelReservation);

export default router;
