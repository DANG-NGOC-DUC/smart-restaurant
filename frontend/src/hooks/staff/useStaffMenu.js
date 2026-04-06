import { useState, useEffect, useCallback } from "react";
import * as staffService from "../../services/staff.service";

/**
 * Hook lấy thực đơn cho nhân viên đặt món.
 * Trả về categories + items, hỗ trợ lọc theo category và search.
 */
export function useStaffMenu() {
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getMenu();
      setCategories(res.data.categories || []);
      setAllItems(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải thực đơn");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Lọc items theo category + search
  const filteredItems = allItems.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category_id === selectedCategory;
    const matchSearch =
      !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return {
    categories,
    items: filteredItems,
    allItems,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    fetchMenu,
  };
}
