import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTablesWithStatus,
  createTable,
  updateTable,
  deleteTable,
  openTableSession,
  closeTableSession,
} from "../../services/admin.service";

export function useAdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true); // true lần đầu
  const [mutating, setMutating] = useState(false); // cho mutation riêng
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTablesWithStatus();
      setTables(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async (data) => {
    setMutating(true);
    setError(null);
    try {
      const res = await createTable(data);
      // Optimistic: thêm bàn mới vào state ngay
      const newTable = {
        ...res.data,
        status: "available",
        session_id: null,
        session_user_id: null,
        session_started_at: null,
      };
      setTables((prev) =>
        [...prev, newTable].sort((a, b) =>
          (a.name || a.code).localeCompare(b.name || b.code),
        ),
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

  const handleUpdateTable = async (id, data) => {
    setMutating(true);
    setError(null);
    try {
      const res = await updateTable(id, data);
      // Optimistic: cập nhật state ngay
      setTables((prev) =>
        prev
          .map((t) => (t.id === id ? { ...t, ...res.data } : t))
          .sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code)),
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

  const handleDeleteTable = async (id) => {
    setMutating(true);
    setError(null);
    try {
      await deleteTable(id);
      // Optimistic: xóa khỏi state ngay
      setTables((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setMutating(false);
    }
  };

  const handleOpenSession = async (tableId) => {
    setMutating(true);
    setError(null);
    try {
      const res = await openTableSession(tableId);
      // Optimistic: đổi status ngay
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: "occupied",
                session_id: res.data.id,
                session_started_at: res.data.started_at,
              }
            : t,
        ),
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

  const handleCloseSession = async (tableId, { force = false } = {}) => {
    setMutating(true);
    setError(null);
    try {
      const res = await closeTableSession(tableId, { force });
      // Optimistic: đổi status ngay
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: "available",
                session_id: null,
                session_user_id: null,
                session_started_at: null,
              }
            : t,
        ),
      );
      return res.data;
    } catch (err) {
      // 409 = còn món chưa lên → re-throw kèm data để component xử lý
      if (err?.response?.status === 409) {
        const unservedErr = new Error("UNSERVED_ITEMS");
        unservedErr.unservedItems = err.response.data.unservedItems;
        unservedErr.unservedCount = err.response.data.unservedCount;
        throw unservedErr;
      }
      const msg = err?.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setMutating(false);
    }
  };

  // Memoize thống kê
  const stats = useMemo(
    () => ({
      total: tables.length,
      available: tables.filter((t) => t.status === "available").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
    }),
    [tables],
  );

  return {
    tables,
    stats,
    loading,
    mutating,
    error,
    refetch: fetchTables,
    createTable: handleCreateTable,
    updateTable: handleUpdateTable,
    deleteTable: handleDeleteTable,
    openSession: handleOpenSession,
    closeSession: handleCloseSession,
  };
}
