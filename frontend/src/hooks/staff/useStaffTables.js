import { useState, useEffect, useCallback } from "react";
import * as staffService from "../../services/staff.service";
import { useSupabaseRealtime } from "../shared/useSupabaseRealtime";

const FILTER_OPTIONS = {
  ALL: "all",
  OCCUPIED: "occupied",
  EMPTY: "empty",
};

// Bảng cần theo dõi: session thay đổi → trạng thái bàn đổi
// orders/order_items thay đổi → tổng tiền đổi
const TABLE_SUBSCRIPTIONS = [
  { table: "sessions", event: "*" },
  { table: "orders", event: "*" },
  { table: "order_items", event: "*" },
];

export function useStaffTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(FILTER_OPTIONS.ALL);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getTables();
      setTables(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch lần đầu
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Realtime: refetch khi sessions/orders/order_items thay đổi
  useSupabaseRealtime("staff-tables", TABLE_SUBSCRIPTIONS, () => {
    fetchTables();
  });

  const filteredTables = tables.filter((table) => {
    if (filter === FILTER_OPTIONS.ALL) return true;
    return table.status === filter;
  });

  const openSession = async (tableId) => {
    try {
      await staffService.openSession(tableId);
      await fetchTables();
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Không thể mở phiên cho bàn",
      );
    }
  };

  const closeSession = async (tableId) => {
    try {
      await staffService.closeSession(tableId);
      await fetchTables();
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Không thể đóng phiên cho bàn",
      );
    }
  };

  const stats = {
    total: tables.length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    empty: tables.filter((t) => t.status === "empty").length,
  };

  return {
    tables: filteredTables,
    allTables: tables,
    loading,
    error,
    filter,
    setFilter,
    fetchTables,
    openSession,
    closeSession,
    stats,
    FILTER_OPTIONS,
  };
}
