import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as staffService from "../services/staff.service";
import { useSupabaseRealtime } from "../hooks/shared/useSupabaseRealtime";

const PendingOrdersContext = createContext(null);

const ORDER_SUBSCRIPTIONS = [
  { table: "orders", event: "*" },
  { table: "order_items", event: "*" },
];

export function PendingOrdersProvider({ children }) {
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

  useSupabaseRealtime("staff-pending-orders", ORDER_SUBSCRIPTIONS, () => {
    fetchOrders();
  });

  const approve = async (orderId) => {
    try {
      await staffService.approveOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      throw new Error(err.response?.data?.error || "Không thể duyệt đơn hàng");
    }
  };

  const cancel = async (orderId) => {
    try {
      await staffService.cancelPendingOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      throw new Error(err.response?.data?.error || "Không thể hủy đơn hàng");
    }
  };

  const pendingCount = orders.length;

  return (
    <PendingOrdersContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        approve,
        cancel,
        pendingCount,
      }}
    >
      {children}
    </PendingOrdersContext.Provider>
  );
}

export function usePendingOrders() {
  const ctx = useContext(PendingOrdersContext);
  if (!ctx) {
    throw new Error(
      "usePendingOrders must be used within PendingOrdersProvider",
    );
  }
  return ctx;
}
