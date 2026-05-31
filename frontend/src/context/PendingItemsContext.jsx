import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as staffService from "../services/staff.service";
import { useSupabaseRealtime } from "../hooks/shared/useSupabaseRealtime";

const PendingItemsContext = createContext(null);

const PENDING_SUBSCRIPTIONS = [{ table: "order_items", event: "*" }];

export function PendingItemsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getReadyItems();
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải danh sách món chờ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useSupabaseRealtime("staff-pending-items", PENDING_SUBSCRIPTIONS, () => {
    fetchItems();
  });

  const markServed = async (itemId) => {
    try {
      await staffService.markItemServed(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Không thể đánh dấu đã lên món",
      );
    }
  };

  const cancelItem = async (itemId, reason) => {
    try {
      await staffService.cancelItem(itemId, reason);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      throw new Error(err.response?.data?.error || "Không thể hủy món");
    }
  };

  return (
    <PendingItemsContext.Provider
      value={{ items, loading, error, fetchItems, markServed, cancelItem }}
    >
      {children}
    </PendingItemsContext.Provider>
  );
}

export function usePendingItems() {
  const ctx = useContext(PendingItemsContext);
  if (!ctx) {
    throw new Error("usePendingItems must be used within PendingItemsProvider");
  }
  return ctx;
}
