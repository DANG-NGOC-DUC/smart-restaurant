import { Search } from "lucide-react";
import { useState } from "react";
import InventoryCard from "../../components/chef/InventoryCard";

function ChefInventory() {
  const foods = [
    {
      id: 1,
      name: "Cua Biển Luộc Sả Gừng",
      category: "Hải sản",
      description:
        "Cua biển tươi ngọt hấp hành sả gừng giữ nguyên độ ngọt tự nhiên từ biển cả.",
      price: "350.000 đ",
      status: "available",
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae",
    },

    {
      id: 2,
      name: "Cá Lóc Nướng Trui Miền Tây",
      category: "Hải sản",
      description:
        "Cá lóc đồng nướng rơm thơm lừng cuốn bánh tráng chấm mắm nêm đậm vị.",
      price: "180.000 đ",
      status: "low",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    },

    {
      id: 3,
      name: "Cá Điều Hồng Chiên Sốt Ớt",
      category: "Hải sản",
      description: "Cá chiên giòn rưới nước sốt chua ngọt đậm vị truyền thống.",
      price: "160.000 đ",
      status: "available",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
    },

    {
      id: 4,
      name: "Bạch Tuộc Sa Tế Xào Cay",
      category: "Hải sản",
      description:
        "Bạch tuộc tươi giòn xào lăn với sa tế tỏi ớt thơm nồng cay tê lôi cuốn.",
      price: "200.000 đ",
      status: "available",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    },

    {
      id: 5,
      name: "Nước Ngọt Coca-Cola Lạnh",
      category: "Đồ uống",
      description:
        "Nước ngọt có ga sảng khoái mát lạnh tức thì giải ngay hiệu quả.",
      price: "18.000 đ",
      status: "available",
      image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e",
    },

    {
      id: 6,
      name: "Bia Saigon Special Ướp Lạnh",
      category: "Đồ uống",
      description:
        "Bia hương vị thượng hạng đậm đà sảng khoái bất tận cuộc vui.",
      price: "25.000 đ",
      status: "available",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b",
    },

    {
      id: 7,
      name: "Ba Chỉ Nướng Muối Ớt",
      category: "Thịt",
      description:
        "Thịt ba chỉ nướng vàng ruộm, đậm vị muối ớt cay thơm hấp dẫn.",
      price: "220.000 đ",
      status: "low",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
    },

    {
      id: 8,
      name: "Lẩu Hải Sản Chua Cay",
      category: "Rau & Lẩu",
      description:
        "Lẩu nóng hổi với rau xanh, nấm tươi và hải sản chua cay tròn vị.",
      price: "320.000 đ",
      status: "available",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554",
    },

    {
      id: 9,
      name: "Gỏi Rau Củ Trộn Mè",
      category: "Rau & Lẩu",
      description:
        "Rau củ tươi giòn trộn mè rang thanh nhẹ, phù hợp món khai vị.",
      price: "95.000 đ",
      status: "low",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    },
  ];

  const categories = ["Tất cả", "Hải sản", "Thịt", "Rau & Lẩu", "Đồ uống"];
  const stockFilters = [
    { key: "all", label: "Tất cả" },
    { key: "available", label: "Còn món" },
    { key: "low", label: "Sắp hết" },
    { key: "out", label: "Hết món" },
  ];

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredFoods = foods.filter((item) => {
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

  const categoryCounts = categories.reduce((counts, category) => {
    if (category === "Tất cả") {
      counts[category] = foods.length;
      return counts;
    }

    counts[category] = foods.filter(
      (item) => item.category === category,
    ).length;
    return counts;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
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
                  {item.toUpperCase()} ({categoryCounts[item]})
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

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredFoods.length === 0 ? (
            <div className="col-span-full rounded-[24px] border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
              Không tìm thấy món phù hợp.
            </div>
          ) : (
            filteredFoods.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ChefInventory;
