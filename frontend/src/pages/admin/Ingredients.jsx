"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  PackagePlus,
  Warehouse,
  ChevronUp,
  ChevronDown,
  Eye,
  X,
  Filter,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAdminIngredients } from "../../hooks/admin/ingredient";
import { useAdminInventory } from "../../hooks/admin/inventory";
import { getIngredientDishes } from "../../services/admin.service";
import IngredientFormModal from "../../components/admin/IngredientFormModal";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "out", label: "Hết hàng" },
  { key: "no_stock", label: "Chưa nhập kho" },
];

function Ingredients() {
  const {
    ingredients,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  } = useAdminIngredients();

  const {
    inventory,
    loading: invLoading,
    error: invError,
    addStock,
    setStock: setStockAction,
  } = useAdminInventory();

  // Map inventory by ingredient_id for quick lookup
  const stockMap = useMemo(() => {
    const m = {};
    inventory.forEach((inv) => {
      m[inv.ingredient_id] = inv;
    });
    return m;
  }, [inventory]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [unitFilter, setUnitFilter] = useState("");
  const [sortField, setSortField] = useState("name"); // name | stock
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingItem, setEditingItem] = useState(null);

  // Stock modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockTarget, setStockTarget] = useState(null);
  const [stockMode, setStockMode] = useState("add");
  const [stockAmount, setStockAmount] = useState("");
  const [stockSubmitting, setStockSubmitting] = useState(false);
  const [stockError, setStockError] = useState(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Related dishes modal
  const [dishesModalOpen, setDishesModalOpen] = useState(false);
  const [dishesTarget, setDishesTarget] = useState(null);
  const [relatedDishes, setRelatedDishes] = useState([]);
  const [dishesLoading, setDishesLoading] = useState(false);

  // Helper: check stock status
  const getStockStatus = (ing) => {
    const inv = stockMap[ing.id];
    if (!inv) return "no_stock";
    const current = parseFloat(inv.current_stock);
    if (current <= 0) return "out";
    return "ok";
  };

  // Unique units for filter dropdown
  const uniqueUnits = useMemo(() => {
    const units = [...new Set(ingredients.map((i) => i.unit))].sort();
    return units;
  }, [ingredients]);

  // Computed: tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: 0, out: 0, no_stock: 0 };
    ingredients.forEach((ing) => {
      counts.all++;
      const status = getStockStatus(ing);
      if (status === "out") counts.out++;
      else if (status === "no_stock") counts.no_stock++;
    });
    return counts;
  }, [ingredients, stockMap]);

  // Filtered + sorted ingredients
  const filteredIngredients = useMemo(() => {
    let result = ingredients.filter((ing) => {
      // Search
      if (
        searchQuery &&
        !ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      // Unit filter
      if (unitFilter && ing.unit !== unitFilter) return false;
      // Tab filter
      if (activeTab !== "all") {
        const status = getStockStatus(ing);
        if (activeTab === "out" && status !== "out") return false;
        if (activeTab === "no_stock" && status !== "no_stock") return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name, "vi");
      } else if (sortField === "stock") {
        const sa = stockMap[a.id]
          ? parseFloat(stockMap[a.id].current_stock)
          : -1;
        const sb = stockMap[b.id]
          ? parseFloat(stockMap[b.id].current_stock)
          : -1;
        cmp = sa - sb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [
    ingredients,
    searchQuery,
    unitFilter,
    activeTab,
    sortField,
    sortDir,
    stockMap,
  ]);

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp className="w-3 h-3 text-sea-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-sea-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-sea-600" />
    );
  };

  // Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    if (modalMode === "create") {
      await createIngredient(data);
    } else {
      await updateIngredient(editingItem.id, data);
    }
  };

  const handleDelete = async (id) => {
    await deleteIngredient(id);
    setDeleteConfirm(null);
  };

  // Stock handlers
  const handleOpenStock = (ing, mode) => {
    setStockTarget(ing);
    setStockMode(mode);
    setStockAmount("");
    setStockError(null);
    setStockModalOpen(true);
  };

  const handleStockSubmit = async () => {
    const val = Number(stockAmount);
    if (
      isNaN(val) ||
      (stockMode === "add" && val <= 0) ||
      (stockMode === "set" && val < 0)
    ) {
      setStockError(
        stockMode === "add"
          ? "Số lượng phải lớn hơn 0."
          : "Số lượng phải >= 0.",
      );
      return;
    }
    setStockSubmitting(true);
    setStockError(null);
    try {
      if (stockMode === "add") {
        await addStock(stockTarget.id, val);
      } else {
        await setStockAction(stockTarget.id, val);
      }
      setStockModalOpen(false);
    } catch (err) {
      setStockError(err.message);
    } finally {
      setStockSubmitting(false);
    }
  };

  // Related dishes handler
  const handleViewDishes = async (ing) => {
    setDishesTarget(ing);
    setDishesModalOpen(true);
    setDishesLoading(true);
    try {
      const res = await getIngredientDishes(ing.id);
      setRelatedDishes(res.data);
    } catch {
      setRelatedDishes([]);
    } finally {
      setDishesLoading(false);
    }
  };

  const hasActiveFilters = searchQuery || unitFilter || activeTab !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setUnitFilter("");
    setActiveTab("all");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">
            Nguyên liệu & Tồn kho
          </h1>
          <p className="text-sea-500">
            Quản lý nguyên liệu và theo dõi tồn kho
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm nguyên liệu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sea-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-sea-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sea-800">
                {ingredients.length}
              </p>
              <p className="text-sm text-sea-500">Tổng nguyên liệu</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sea-800">
                {inventory.length}
              </p>
              <p className="text-sm text-sea-500">Đã có tồn kho</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-crimson-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-crimson-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sea-800">{tabCounts.out}</p>
              <p className="text-sm text-sea-500">Đã hết hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-sea-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-sea-500 text-sea-700"
                : "border-transparent text-sea-400 hover:text-sea-600"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs ${
                activeTab === tab.key
                  ? "bg-sea-100 text-sea-700"
                  : "bg-sea-50 text-sea-400"
              }`}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Unit filter */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-sea-400" />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-3 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            >
              <option value="">Tất cả đơn vị</option>
              {uniqueUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-sea-500 hover:text-sea-700 hover:bg-sea-50 rounded-lg transition-colors"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {(error || invError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error || invError}
        </div>
      )}

      {/* Loading */}
      {(loading || invLoading) && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-sea-200 border-t-sea-500 rounded-full animate-spin" />
          <p className="text-sea-500 mt-2">Đang tải...</p>
        </div>
      )}

      {/* Table */}
      {!loading && !invLoading && (
        <div className="bg-white rounded-xl shadow-card border border-sea-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sea-50 border-b border-sea-100">
                  <th
                    className="text-left px-6 py-3 text-xs font-semibold text-sea-600 uppercase tracking-wider cursor-pointer select-none hover:text-sea-800"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Tên nguyên liệu
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-sea-600 uppercase tracking-wider">
                    Đơn vị
                  </th>
                  <th
                    className="text-right px-6 py-3 text-xs font-semibold text-sea-600 uppercase tracking-wider cursor-pointer select-none hover:text-sea-800"
                    onClick={() => handleSort("stock")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Tồn kho hiện tại
                      <SortIcon field="stock" />
                    </div>
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-sea-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea-50">
                {filteredIngredients.map((ing) => {
                  const inv = stockMap[ing.id];
                  const currentStock = inv
                    ? parseFloat(inv.current_stock)
                    : null;
                  const status = getStockStatus(ing);

                  return (
                    <tr
                      key={ing.id}
                      className={`hover:bg-sea-50/50 transition-colors ${
                        status === "out" ? "bg-crimson-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sea-800">
                            {ing.name}
                          </span>
                          {status === "out" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-crimson-100 text-crimson-700">
                              <XCircle className="w-3 h-3" />
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-sea-100 text-sea-700">
                          {ing.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {currentStock !== null ? (
                          <div className="inline-flex flex-col items-end">
                            <span
                              className={`font-medium ${
                                status === "out"
                                  ? "text-crimson-600"
                                  : "text-sea-800"
                              }`}
                            >
                              {currentStock} {ing.unit}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sea-300">Chưa nhập</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDishes(ing)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Xem món sử dụng"
                          >
                            <Eye className="w-4 h-4 text-purple-500" />
                          </button>
                          <button
                            onClick={() => handleOpenStock(ing, "add")}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Nhập kho"
                          >
                            <PackagePlus className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleOpenStock(ing, "set")}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Đặt lại tồn kho"
                          >
                            <Warehouse className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4 text-sea-500" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(ing)}
                            className="p-2 hover:bg-crimson-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4 text-crimson-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty */}
          {filteredIngredients.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-sea-200 mx-auto mb-3" />
              <p className="text-sea-500">
                {hasActiveFilters
                  ? "Không tìm thấy nguyên liệu phù hợp"
                  : "Chưa có nguyên liệu nào"}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-sea-500 hover:text-sea-700 underline"
                >
                  Xóa bộ lọc
                </button>
              ) : (
                <button
                  onClick={handleOpenCreate}
                  className="mt-2 text-sm text-sea-500 hover:text-sea-700 underline"
                >
                  Thêm nguyên liệu đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-sea-800">Xác nhận xóa</h3>
            <p className="text-sm text-sea-600">
              Bạn có chắc muốn xóa nguyên liệu{" "}
              <strong>{deleteConfirm.name}</strong>? Các công thức sử dụng
              nguyên liệu này cũng sẽ bị ảnh hưởng.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-crimson-500 text-white rounded-lg font-medium hover:bg-crimson-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock modal */}
      {stockModalOpen && stockTarget && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-sea-800">
              {stockMode === "add" ? "Nhập kho" : "Đặt lại tồn kho"}
            </h3>
            <p className="text-sm text-sea-600">
              {stockMode === "add"
                ? "Thêm số lượng vào kho cho"
                : "Đặt lại số lượng tồn kho cho"}{" "}
              <strong>{stockTarget.name}</strong>
              {stockMap[stockTarget.id] && (
                <span className="block mt-1 text-sea-400">
                  Hiện tại: {stockMap[stockTarget.id].current_stock}{" "}
                  {stockTarget.unit}
                </span>
              )}
            </p>

            {stockError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {stockError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sea-700 mb-1">
                Số lượng ({stockTarget.unit})
              </label>
              <input
                type="number"
                min={stockMode === "add" ? "0.001" : "0"}
                step="0.001"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                placeholder={
                  stockMode === "add"
                    ? "Nhập số lượng thêm vào"
                    : "Nhập số lượng mới"
                }
                className="w-full px-3 py-2.5 border border-sea-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStockModalOpen(false)}
                className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleStockSubmit}
                disabled={stockSubmitting}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                  stockMode === "add"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } disabled:opacity-50`}
              >
                {stockSubmitting
                  ? "Đang xử lý..."
                  : stockMode === "add"
                    ? "Nhập kho"
                    : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related dishes modal */}
      {dishesModalOpen && dishesTarget && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-sea-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-sea-800">
                  Món sử dụng nguyên liệu
                </h3>
                <p className="text-sm text-sea-500 mt-0.5">
                  {dishesTarget.name}
                </p>
              </div>
              <button
                onClick={() => setDishesModalOpen(false)}
                className="p-2 hover:bg-sea-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-sea-500" />
              </button>
            </div>
            <div className="p-6">
              {dishesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-sea-500" />
                  <span className="ml-2 text-sea-500 text-sm">Đang tải...</span>
                </div>
              ) : relatedDishes.length > 0 ? (
                <div className="space-y-3">
                  {relatedDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="flex items-center justify-between p-3 bg-sea-50 rounded-lg"
                    >
                      <span className="font-medium text-sea-700">
                        {dish.menu_item_name}
                      </span>
                      <span className="text-sm text-sea-500">
                        {dish.quantity_needed} {dishesTarget.unit} / phần
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sea-400">
                  <Package className="w-10 h-10 mx-auto mb-2 text-sea-200" />
                  <p>Chưa có món nào sử dụng nguyên liệu này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ingredient form modal */}
      <IngredientFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ingredient={editingItem}
        onSubmit={handleSubmit}
        mode={modalMode}
      />
    </div>
  );
}

export default Ingredients;
