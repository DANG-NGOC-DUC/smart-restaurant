import express from "express";

import tableRoutes from "./table.routes.js";
import menuRoutes from "./menu.route.js";
import orderRoutes from "./order.route.js";
import callRoutes from "./call.route.js";
import reviewRoutes from "./review.route.js";
import reservationRoutes from "./reservation.route.js";
import profileRoutes from "./profile.route.js";

const router = express.Router();

router.use("/tables", tableRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/service-requests", callRoutes);
router.use("/reviews", reviewRoutes);
router.use("/reservations", reservationRoutes);
router.use("/profile", profileRoutes);

export default router;
