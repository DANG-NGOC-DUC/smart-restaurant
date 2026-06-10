import { Search, Package, UtensilsCrossed } from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import InventoryCard from "../../components/chef/InventoryCard";
import { getAllMenuItems, getAllInventory } from "../../services/admin.service";
import { toggleMenuItemAvailability } from "../../services/staff.service";

function ChefInventory() {
  const [activeTab, setActiveTab] = useState("menu"); // "menu" | "inventory"
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [menuRes, invRes] = await Promise.all([
        getAllMenuItems(),
        getAllInventory()
      ]);
      
      const items = Array.isArray(menuRes.data) ? menuRes.data : [];
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

      const invData = Array.isArray(invRes.data) ? invRes.data : [];
      setInventoryItems(invData);

    } catch (err) {
      console.error("Lỗi fetch data:", err);
      setError(err?.response?.data?.error || "Không thể tải dữ liệu.");
      setMenuItems([]);
      setInventoryItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const onMenuUpdated = () => {
      fetchData();
    };

    window.addEventListener("menuUpdated", onMenuUpdated);
    return () => {
      window.removeEventListener("menuUpdated", onMenuUpdated);
    };
  }, [fetchData]);

  const handleToggleMenuItem = async (itemId, newIsAvailable) => {
    try {
      // Optimistic update
      setMenuItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, status: newIsAvailable ? "available" : "out", is_available: newIsAvailable } 
          : item
      ));
      
      await toggleMenuItemAvailability(itemId, newIsAvailable);
    } catch (err) {
      console.error("Toggle error:", err);
      // Revert on error
      fetchData();
      alert("Không thể đổi trạng thái món ăn: " + (err?.response?.data?.error || "Lỗi server"));
    }
  };

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

  const filteredInventory = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return inventoryItems.filter((item) => {
      return search.length === 0 || item.ingredient_name.toLowerCase().includes(search);
    });
  }, [inventoryItems, searchText]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
              activeTab === "menu"
                ? "border-[#0f5f63] text-[#0f5f63]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Món Ăn
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
              activeTab === "inventory"
                ? "border-[#0f5f63] text-[#0f5f63]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Package className="h-4 w-4" />
            Kho Nguyên Liệu
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
              <p className="text-slate-500">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative w-full max-w-[420px]">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === "menu" ? "Tìm kiếm món..." : "Tìm nguyên liệu..."}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="h-11 w-full rounded-full border border-slate-200 bg-white pl-12 pr-5 text-[14px] font-medium text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {activeTab === "menu" && (
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
            )}
          </div>
        )}

        {!loading && activeTab === "menu" && (
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredFoods.length === 0 ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
                {menuItems.length === 0
                  ? "Không có menu nào để hiển thị."
                  : "Không tìm thấy món phù hợp."}
              </div>
            ) : (
              filteredFoods.map((item) => (
                <InventoryCard key={item.id} item={item} onToggle={handleToggleMenuItem} />
              ))
            )}
          </div>
        )}

        {!loading && activeTab === "inventory" && (
          <div className="mt-5 rounded-[24px] bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nguyên liệu</th>
                    <th className="px-6 py-4 font-semibold">Đơn vị tính</th>
                    <th className="px-6 py-4 font-semibold">Tồn kho hiện tại</th>
                    <th className="px-6 py-4 font-semibold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        {inventoryItems.length === 0 
                          ? "Kho chưa có nguyên liệu nào." 
                          : "Không tìm thấy nguyên liệu phù hợp."}
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLow = Number(item.quantity) <= Number(item.min_quantity);
                      return (
                        <tr key={item.ingredient_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {item.ingredient_name}
                          </td>
                          <td className="px-6 py-4">
                            {item.unit}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                              {item.quantity}
                            </span>
                            <span className="text-slate-400 text-xs ml-1">
                              / Tối thiểu: {item.min_quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isLow ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-500/10">
                                Sắp hết
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 ring-1 ring-inset ring-green-500/10">
                                Đầy đủ
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefInventory;
