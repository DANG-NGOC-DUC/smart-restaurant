import { useCallback, useEffect, useState } from "react";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/admin.service";

export function useAdminMenuItems(initialFilters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchItems = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      // Lọc bỏ params undefined/null
      const cleanParams = {};
      const p = params || {};
      if (p.category_id) cleanParams.category_id = p.category_id;
      if (p.is_available !== undefined && p.is_available !== "")
        cleanParams.is_available = p.is_available;
      if (p.search) cleanParams.search = p.search;

      const res = await getAllMenuItems(cleanParams);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(filters);
  }, [fetchItems, filters]);

  const dispatchMenuUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("menuUpdated"));
    }
  };

  const handleCreate = async (formData) => {
    setError(null);
    try {
      const res = await createMenuItem(formData);
      await fetchItems(filters);
      dispatchMenuUpdated();
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdate = async (id, formData) => {
    setError(null);
    try {
      const res = await updateMenuItem(id, formData);
      await fetchItems(filters);
      dispatchMenuUpdated();
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
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      dispatchMenuUpdated();
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const getDetail = async (id) => {
    try {
      const res = await getMenuItemById(id);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      throw new Error(msg);
    }
  };

  return {
    items,
    loading,
    error,
    filters,
    setFilters,
    refetch: () => fetchItems(filters),
    createItem: handleCreate,
    updateItem: handleUpdate,
    deleteItem: handleDelete,
    getDetail,
  };
}
