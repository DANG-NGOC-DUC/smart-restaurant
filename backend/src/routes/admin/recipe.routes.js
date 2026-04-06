import express from "express";
import { recipeController } from "../../controllers/admin/recipe.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// GET /api/admin/menu-items/:menuItemId/ingredients
router.get(
  "/:menuItemId/ingredients",
  auth,
  allowRoles("admin"),
  recipeController.getRecipe,
);

// POST /api/admin/menu-items/:menuItemId/ingredients
router.post(
  "/:menuItemId/ingredients",
  auth,
  allowRoles("admin"),
  recipeController.setRecipe,
);

// PUT /api/admin/menu-items/:menuItemId/ingredients/:ingredientId
router.put(
  "/:menuItemId/ingredients/:ingredientId",
  auth,
  allowRoles("admin"),
  recipeController.updateRecipeItem,
);

// DELETE /api/admin/menu-items/:menuItemId/ingredients/:ingredientId
router.delete(
  "/:menuItemId/ingredients/:ingredientId",
  auth,
  allowRoles("admin"),
  recipeController.removeRecipeItem,
);

export default router;
