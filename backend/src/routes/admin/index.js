import express from "express";
import userRoutes from "./user.routes.js";
import ingredientRoutes from "./ingredient.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import inventoryShiftRoutes from "./inventoryShift.routes.js";
import recipeRoutes from "./recipe.routes.js";
import menuItemRoutes from "./menuItem.routes.js";
import menuCategoryRoutes from "./menuCategory.routes.js";
import tableRoutes from "./table.routes.js";
import orderRoutes from "./order.routes.js";
import reportRoutes from "./report.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import reviewRoutes from "./review.routes.js";
import menuItemVariantRoutes from "./menuItemVariant.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/inventory-shifts", inventoryShiftRoutes);
router.use("/menu-categories", menuCategoryRoutes);
router.use("/menu-items", recipeRoutes); // /:menuItemId/ingredients (recipes)
router.use("/menu-items", menuItemRoutes); // CRUD món ăn + upload ảnh
router.use("/menu-items", menuItemVariantRoutes); // variants (size)
router.use("/tables", tableRoutes);
router.use("/orders", orderRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reviews", reviewRoutes);

export default router;
