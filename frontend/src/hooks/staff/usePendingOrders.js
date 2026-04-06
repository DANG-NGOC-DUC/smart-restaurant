import { useState, useEffect, useCallback } from "react";
import * as staffService from "../../services/staff.service";
import { useSupabaseRealtime } from "../shared/useSupabaseRealtime";

// Theo dõi orders: khi có order mới pending → hiện lên list
const ORDER_SUBSCRIPTIONS = [
  { table: "orders", event: "*" },
  { table: "order_items", event: "*" },
];

export function usePendingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getPendingOrders();
      setOrders(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Không thể tải danh sách đơn chờ duyệt",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime: refetch khi orders/order_items thay đổi
  useSupabaseRealtime("staff-pending-orders", ORDER_SUBSCRIPTIONS, () => {
    fetchOrders();
  });

  const approve = async (orderId) => {
    try {
      await staffService.approveOrder(orderId);
      // Xóa ngay khỏi list (optimistic)
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      throw new Error(err.response?.data?.error || "Không thể duyệt đơn hàng");
    }
  };

  const pendingCount = orders.length;

  return {
    orders,
    loading,
    error,
    fetchOrders,
    approve,
    pendingCount,
  };
}
