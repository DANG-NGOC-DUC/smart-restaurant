import { useState, useCallback } from "react";
import { publicService } from "../../services/public.service";

export function usePublicOrder() {
  const [loading, setLoading] = useState(false);

  const createOrder = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await publicService.createOrder(data);
      return res.data;
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrdersBySession = useCallback(async (sessionId) => {
    try {
      const res = await publicService.getOrdersBySession(sessionId);
      return res.data;
    } catch (error) {
      console.error("Lỗi lấy orders:", error);
      throw error;
    }
  }, []);

  const getStatus = useCallback(async (id) => {
    try {
      const res = await publicService.getOrderStatus(id);
      return res.data;
    } catch (error) {
      console.error("Lỗi lấy trạng thái:", error);
      throw error;
    }
  }, []);

  return { createOrder, getOrdersBySession, getStatus, loading };
}
