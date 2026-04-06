import { useState, useEffect, useCallback } from "react";
import * as staffService from "../../services/staff.service";
import { useSupabaseRealtime } from "../shared/useSupabaseRealtime";

// Theo dõi order_items: khi status đổi thành ready → hiện lên list
const PENDING_SUBSCRIPTIONS = [{ table: "order_items", event: "*" }];

export function usePendingItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getPendingItems();
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải danh sách món chờ");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch lần đầu
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Realtime: refetch khi order_items thay đổi
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

  return {
    items,
    loading,
    error,
    fetchItems,
    markServed,
    cancelItem,
  };
}
