import { useCallback, useEffect, useState } from "react";
import {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../../services/admin.service";

export function useAdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllIngredients();
      setIngredients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleCreate = async (data) => {
    setError(null);
    try {
      const res = await createIngredient(data);
      await fetchIngredients();
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdate = async (id, data) => {
    setError(null);
    try {
      const res = await updateIngredient(id, data);
      await fetchIngredients();
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    ingredients,
    loading,
    error,
    refetch: fetchIngredients,
    createIngredient: handleCreate,
    updateIngredient: handleUpdate,
    deleteIngredient: handleDelete,
  };
}
