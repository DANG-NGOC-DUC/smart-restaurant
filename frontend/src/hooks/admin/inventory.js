import { useCallback, useEffect, useState } from "react";
import {
  getAllInventory,
  getLowStock,
  addStock,
  setStock,
} from "../../services/admin.service";

export function useAdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllInventory();
      setInventory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await getLowStock();
      setLowStockItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Không thể tải danh sách sắp hết:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchLowStock();
  }, [fetchInventory, fetchLowStock]);

  const handleAddStock = async (ingredientId, amount) => {
    setError(null);
    try {
      const res = await addStock(ingredientId, amount);
      await fetchInventory();
      await fetchLowStock();
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleSetStock = async (ingredientId, stock) => {
    setError(null);
    try {
      const res = await setStock(ingredientId, stock);
      await fetchInventory();
      await fetchLowStock();
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    inventory,
    lowStock,
    loading,
    error,
    refetch: fetchInventory,
    addStock: handleAddStock,
    setStock: handleSetStock,
  };
}
