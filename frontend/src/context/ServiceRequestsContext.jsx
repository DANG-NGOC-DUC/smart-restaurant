import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as staffService from "../services/staff.service";
import { useSupabaseRealtime } from "../hooks/shared/useSupabaseRealtime";

const ServiceRequestsContext = createContext(null);

const REQUEST_SUBSCRIPTIONS = [{ table: "service_requests", event: "*" }];

export function ServiceRequestsProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getServiceRequests();
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useSupabaseRealtime("staff-service-requests", REQUEST_SUBSCRIPTIONS, () => {
    fetchRequests();
  });

  const acknowledge = async (requestId) => {
    try {
      await staffService.acknowledgeRequest(requestId);
      await fetchRequests();
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Không thể nhận xử lý yêu cầu",
      );
    }
  };

  const resolve = async (requestId) => {
    try {
      await staffService.resolveRequest(requestId);
      await fetchRequests();
    } catch (err) {
      throw new Error(
        err.response?.data?.error || "Không thể hoàn tất yêu cầu",
      );
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <ServiceRequestsContext.Provider
      value={{
        requests,
        loading,
        error,
        fetchRequests,
        acknowledge,
        resolve,
        pendingCount,
      }}
    >
      {children}
    </ServiceRequestsContext.Provider>
  );
}

export function useServiceRequests() {
  const ctx = useContext(ServiceRequestsContext);
  if (!ctx) {
    throw new Error(
      "useServiceRequests must be used within ServiceRequestsProvider",
    );
  }
  return ctx;
}
