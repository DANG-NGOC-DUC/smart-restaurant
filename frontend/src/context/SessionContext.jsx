import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { storage } from "../utils/storage";
import { publicService } from "../services/public.service";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [table, setTable] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from storage on mount
  useEffect(() => {
    const stored = storage.getSession();
    if (stored) {
      setTable(stored.table || null);
      setSession(stored.session || null);
    }
    setLoading(false);
  }, []);

  // Scan QR token → get table + session info
  const scanTable = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicService.scanTable(token);
      const data = res.data;
      setTable(data.table);
      setSession(data.session);
      storage.setSession({ table: data.table, session: data.session });
      return data;
    } catch (err) {
      const msg = err?.response?.data?.error || "Mã QR không hợp lệ";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setTable(null);
    setSession(null);
    setError(null);
    storage.clearSession();
  }, []);

  const hasSession = !!table;
  const tableId = table?.id || null;
  const tableName = table?.name || "";
  const sessionId = session?.id || null;

  return (
    <SessionContext.Provider
      value={{
        table,
        session,
        loading,
        error,
        hasSession,
        tableId,
        tableName,
        sessionId,
        scanTable,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
