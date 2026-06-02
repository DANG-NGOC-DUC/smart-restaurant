import { Search } from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import InventoryCard from "../../components/chef/InventoryCard";
import { getAllMenuItems } from "../../services/admin.service";

function ChefInventory() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllMenuItems();
      const items = Array.isArray(res.data) ? res.data : [];

      const transformedItems = items.map((item) => ({
        ...item,
        id: item.id,
        name: item.name,
        category: item.category_name || "Không xác định",
        description: item.description || "",
        price: item.price,
        image: item.image_url,
        status: item.is_available ? "available" : "out",
        stockText: item.is_available
          ? `${Number(item.price).toLocaleString("vi-VN")} đ`
          : "Hết hàng",
      }));

      setMenuItems(transformedItems);
    } catch (err) {
      console.error("Lỗi fetch menu items:", err);
      setError(err?.response?.data?.error || "Không thể tải danh sách món");
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllItems();

    const onMenuUpdated = () => {
      fetchAllItems();
    };

    window.addEventListener("menuUpdated", onMenuUpdated);
    return () => {
      window.removeEventListener("menuUpdated", onMenuUpdated);
    };
  }, [fetchAllItems]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(menuItems.map((item) => item.category));
    return ["Tất cả", ...Array.from(uniqueCategories).sort()];
  }, [menuItems]);

  const filteredFoods = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesSearch =
        search.length === 0 ||
        [item.name, item.category, item.description]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesCategory =
        selectedCategory === "Tất cả" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchText, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
              <p className="text-slate-500">Đang tải danh sách hết món...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative w-full max-w-[420px]">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Tìm kiếm món..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="h-11 w-full rounded-full border border-slate-200 bg-white pl-12 pr-5 text-[14px] font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-[#0f5f63] text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredFoods.length === 0 ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
                {menuItems.length === 0
                  ? "Không có menu nào để hiển thị."
                  : "Không tìm thấy món phù hợp."}
              </div>
            ) : (
              filteredFoods.map((item) => (
                <InventoryCard key={item.id} item={item} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefInventory;
