import { useCallback, useState } from "react";
import {
  getMenuItemVariants,
  createMenuItemVariant,
  updateMenuItemVariant,
  deleteMenuItemVariant,
} from "../../services/admin.service";

export function useAdminMenuItemVariant() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVariants = useCallback(async (menuItemId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMenuItemVariants(menuItemId);
      const data = Array.isArray(res.data) ? res.data : [];
      setVariants(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (menuItemId, data) => {
    setError(null);
    try {
      const res = await createMenuItemVariant(menuItemId, data);
      await fetchVariants(menuItemId);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdate = async (menuItemId, variantId, data) => {
    setError(null);
    try {
      const res = await updateMenuItemVariant(variantId, data);
      await fetchVariants(menuItemId);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleDelete = async (menuItemId, variantId) => {
    setError(null);
    try {
      await deleteMenuItemVariant(variantId);
      await fetchVariants(menuItemId);
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    variants,
    loading,
    error,
    fetchVariants,
    createVariant: handleCreate,
    updateVariant: handleUpdate,
    deleteVariant: handleDelete,
  };
}
