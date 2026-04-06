import { useCallback, useState } from "react";
import { getOrderHistory, getOrderById } from "../../services/admin.service";

export function useOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    total_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderHistory(filters);
      const data = res.data;
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setPagination(
        data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      );
      setSummary(
        data.summary || {
          total_orders: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          total_revenue: 0,
        },
      );
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    orders,
    pagination,
    summary,
    loading,
    error,
    fetchHistory,
    fetchOrderDetail,
  };
}
