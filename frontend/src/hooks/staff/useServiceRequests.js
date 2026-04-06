import { useState, useEffect, useCallback } from "react";
import * as staffService from "../../services/staff.service";
import { useSupabaseRealtime } from "../shared/useSupabaseRealtime";

// Theo dõi service_requests: khi khách gọi NV hoặc NV nhận/hoàn tất
const REQUEST_SUBSCRIPTIONS = [{ table: "service_requests", event: "*" }];

export function useServiceRequests() {
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

  // Fetch lần đầu
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime: refetch khi service_requests thay đổi
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

  return {
    requests,
    loading,
    error,
    fetchRequests,
    acknowledge,
    resolve,
    pendingCount,
  };
}
