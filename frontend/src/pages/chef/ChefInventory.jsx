import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import InventoryCard from "../../components/chef/InventoryCard";
import { getAllMenuItems } from "../../services/admin.service";

function ChefInventory() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all menu items
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all menu items
        const res = await getAllMenuItems();
        const items = Array.isArray(res.data) ? res.data : [];

        // Transform items to match InventoryCard structure
        const transformedItems = items.map((item) => ({
          ...item,
          id: item.id,
          name: item.name,
          category: item.category_name || "Không xác định",
          description: item.description || "",
          price: item.price,
          image: item.image_url,
          // Determine status based on is_available
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
    };

    fetchAllItems();
  }, []);

  // Generate categories from items
  const categories = useMemo(() => {
    const uniqueCategories = new Set(menuItems.map((item) => item.category));
    return ["Tất cả", ...Array.from(uniqueCategories).sort()];
  }, [menuItems]);

  const filteredFoods = useMemo(() => {
    return menuItems.filter((item) => {
      const search = searchText.trim().toLowerCase();
      const matchesSearch =
        search.length === 0 ||
        [item.name, item.category, item.description]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === "Tất cả" || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [menuItems, searchText, selectedCategory, selectedStatus]);

  const categoryCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      if (category === "Tất cả") {
        counts[category] = menuItems.length;
        return counts;
      }

      counts[category] = menuItems.filter(
        (item) => item.category === category,
      ).length;
      return counts;
    }, {});
  }, [categories, menuItems]);

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
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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

              <div className="flex flex-wrap items-center justify-start gap-4 text-[13px] font-semibold sm:justify-end">
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  ON - Còn món
                </span>

                <span className="inline-flex items-center gap-2 text-rose-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  OFF - Hết món
                </span>

                <span className="inline-flex items-center gap-2 text-amber-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  LOW - Sắp hết
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {categories.map((item) => {
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setSelectedCategory(item)}
                    className={`h-10 rounded-full border px-5 text-[13px] font-semibold tracking-[0.01em] transition-all ${
                      selectedCategory === item
                        ? "border-[#0f5f63] bg-[#0f5f63] text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.toUpperCase()} ({categoryCounts[item] || 0})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end text-sm text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setSearchText("");
                  setSelectedCategory("Tất cả");
                  setSelectedStatus("all");
                }}
                className="font-semibold text-[#0f5f63] hover:underline"
              >
                Xóa bộ lọc
              </button>
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
