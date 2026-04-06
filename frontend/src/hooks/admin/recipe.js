import { useCallback, useState } from "react";
import {
  getRecipe,
  setRecipe,
  updateRecipeItem,
  removeRecipeItem,
  getAllIngredients,
} from "../../services/admin.service";

export function useAdminRecipe() {
  const [recipe, setRecipeState] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async (menuItemId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecipe(menuItemId);
      setRecipeState(res.data);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllIngredients = useCallback(async () => {
    try {
      const res = await getAllIngredients();
      setAllIngredients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Không thể tải danh sách nguyên liệu:", err.message);
    }
  }, []);

  const handleSetRecipe = async (menuItemId, ingredients) => {
    setError(null);
    try {
      const res = await setRecipe(menuItemId, ingredients);
      await fetchRecipe(menuItemId);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdateItem = async (menuItemId, ingredientId, qty) => {
    setError(null);
    try {
      const res = await updateRecipeItem(menuItemId, ingredientId, qty);
      await fetchRecipe(menuItemId);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleRemoveItem = async (menuItemId, ingredientId) => {
    setError(null);
    try {
      await removeRecipeItem(menuItemId, ingredientId);
      await fetchRecipe(menuItemId);
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    recipe,
    allIngredients,
    loading,
    error,
    fetchRecipe,
    fetchAllIngredients,
    setRecipe: handleSetRecipe,
    updateRecipeItem: handleUpdateItem,
    removeRecipeItem: handleRemoveItem,
  };
}
