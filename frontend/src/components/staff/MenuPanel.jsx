import { Search, Plus, ImageOff } from "lucide-react";

/**
 * Panel thực đơn: tabs danh mục + search + grid món ăn.
 */
function MenuPanel({
  categories,
  items,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  loading,
}) {
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm món..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sea-500/30 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => onCategoryChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-sea-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-sea-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <p className="text-sm">Đang tải thực đơn...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <p className="text-sm">Không tìm thấy món nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onAddToCart(item)}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden text-left hover:shadow-md hover:border-sea-300 active:scale-[0.98] transition-all group"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageOff className="w-8 h-8" />
                    </div>
                  )}
                  {/* Add overlay */}
                  <div className="absolute inset-0 bg-sea-800/0 group-hover:bg-sea-800/10 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                      <Plus className="w-4 h-4 text-sea-700" />
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-2.5">
                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs font-bold text-coral-600 mt-0.5">
                    {formatMoney(item.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPanel;
