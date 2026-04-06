import { useEffect, useState, useCallback } from "react";
import { publicService } from "../../services/public.service";

export function usePublicMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicService.getPublicMenu(filters);
      setItems(res.data || []);
    } catch (err) {
      console.error("Lỗi fetch menu:", err);
      setError(err?.response?.data?.message || "Không thể tải menu");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGrouped = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicService.getMenuGrouped();
      const data = res.data || [];
      setCategories(data);
      const all = data.flatMap((cat) => cat.items || []);
      setItems(all);
    } catch (err) {
      console.error("Lỗi fetch menu grouped:", err);
      setError("Không thể tải menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchGrouped(), 0);
    return () => clearTimeout(timer);
  }, [fetchGrouped]);

  return { items, categories, loading, error, fetchMenu, fetchGrouped };
}
