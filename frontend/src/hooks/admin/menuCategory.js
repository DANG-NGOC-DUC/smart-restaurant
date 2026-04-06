import { useCallback, useEffect, useState } from "react";
import {
  getAllMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "../../services/admin.service";

export function useAdminMenuCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllMenuCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (data) => {
    setError(null);
    try {
      const res = await createMenuCategory(data);
      await fetchCategories();
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
      const res = await updateMenuCategory(id, data);
      await fetchCategories();
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
      await deleteMenuCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
  };
}
