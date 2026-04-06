import express from "express";
import { ingredientController } from "../../controllers/admin/ingredient.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// GET /api/admin/ingredients
router.get(
  "/",
  auth,
  allowRoles("admin"),
  ingredientController.getAllIngredients,
);

// GET /api/admin/ingredients/:id
router.get(
  "/:id",
  auth,
  allowRoles("admin"),
  ingredientController.getIngredientById,
);

// POST /api/admin/ingredients
router.post(
  "/",
  auth,
  allowRoles("admin"),
  ingredientController.createIngredient,
);

// PUT /api/admin/ingredients/:id
router.put(
  "/:id",
  auth,
  allowRoles("admin"),
  ingredientController.updateIngredient,
);

// DELETE /api/admin/ingredients/:id
router.delete(
  "/:id",
  auth,
  allowRoles("admin"),
  ingredientController.deleteIngredient,
);

// GET /api/admin/ingredients/:id/dishes
router.get(
  "/:id/dishes",
  auth,
  allowRoles("admin"),
  ingredientController.getRelatedDishes,
);

export default router;
