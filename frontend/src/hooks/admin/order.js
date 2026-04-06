import { useCallback, useEffect, useState } from "react";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../../services/admin.service";

export function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrders(filters);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchOrderDetail = async (id) => {
    try {
      const res = await getOrderById(id);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setMutating(true);
    setError(null);
    try {
      const res = await updateOrderStatus(id, status);
      // Optimistic update in list
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setMutating(false);
    }
  };

  // Computed stats
  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) => o.status === "active").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return {
    orders,
    loading,
    mutating,
    error,
    stats,
    refresh: fetchOrders,
    fetchOrderDetail,
    updateStatus: handleUpdateStatus,
  };
}
