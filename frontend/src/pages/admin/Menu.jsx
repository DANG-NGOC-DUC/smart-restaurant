"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  BookOpen,
  ImageIcon,
  Layers,
} from "lucide-react";
import { useAdminMenuItems } from "../../hooks/admin/menuItem";
import { useAdminMenuCategories } from "../../hooks/admin/menuCategory";
import { useAdminRecipe } from "../../hooks/admin/recipe";
import { useAdminMenuItemVariant } from "../../hooks/admin/menuItemVariant";
import MenuItemFormModal from "../../components/admin/MenuItemFormModal";
import CategoryManagerModal from "../../components/admin/CategoryManagerModal";
import RecipeModal from "../../components/admin/RecipeModal";
import VariantManagerModal from "../../components/admin/VariantManagerModal";

function Menu() {
  // Hooks
  const {
    categories,
    loading: catLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: refetchCategories,
  } = useAdminMenuCategories();

  const {
    items,
    loading: itemsLoading,
    filters,
    setFilters,
    createItem,
    updateItem,
    deleteItem,
  } = useAdminMenuItems();

  const {
    recipe,
    allIngredients,
    loading: recipeLoading,
    fetchRecipe,
    fetchAllIngredients,
    setRecipe,
    removeRecipeItem,
  } = useAdminRecipe();

  const {
    variants,
    loading: variantLoading,
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant,
  } = useAdminMenuItemVariant();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState("create");
  const [editingItem, setEditingItem] = useState(null);

  const [catModalOpen, setCatModalOpen] = useState(false);

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeItem, setRecipeItem] = useState(null);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantItem, setVariantItem] = useState(null);

  // Confirm delete
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Handlers - Filter
  const handleCategoryFilter = (catId) => {
    setSelectedCategory(catId);
    setFilters((prev) => ({
      ...prev,
      category_id: catId === "all" ? undefined : catId,
    }));
  };

  const searchTimerRef = useRef(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleSearch = useCallback(
    (value) => {
      setSearchQuery(value);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        setFilters((prev) => ({
          ...prev,
          search: value || undefined,
        }));
      }, 400);
    },
    [setFilters],
  );

  // Handlers - CRUD Item
  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemModalMode("create");
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemModalMode("edit");
    setItemModalOpen(true);
  };

  const handleSubmitItem = async (formData) => {
    if (itemModalMode === "create") {
      await createItem(formData);
    } else {
      await updateItem(editingItem.id, formData);
    }
  };

  const handleDeleteItem = async (id) => {
    await deleteItem(id);
    setDeleteConfirm(null);
  };

  // Handlers - Recipe
  const handleOpenRecipe = async (item) => {
    setRecipeItem(item);
    setRecipeModalOpen(true);
    await Promise.all([fetchRecipe(item.id), fetchAllIngredients()]);
  };

  // Handlers - Variants
  const handleOpenVariants = async (item) => {
    setVariantItem(item);
    setVariantModalOpen(true);
    await fetchVariants(item.id);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Quản lý Menu</h1>
          <p className="text-sea-500">Quản lý các món ăn trong thực đơn</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCatModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-50 text-sea-600 rounded-lg hover:bg-sea-100 transition-colors font-medium border border-sea-200"
          >
            <FolderOpen className="w-4 h-4" />
            Danh mục
          </button>
          <button
            onClick={handleOpenCreateItem}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm món mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-card border border-sea-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-400" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sea-50 border border-sea-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => handleCategoryFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-sea-500 text-white"
                  : "bg-sea-50 text-sea-600 hover:bg-sea-100"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-sea-500 text-white"
                    : "bg-sea-50 text-sea-600 hover:bg-sea-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {itemsLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-sea-200 border-t-sea-500 rounded-full animate-spin"></div>
          <p className="text-sea-500 mt-2">Đang tải...</p>
        </div>
      )}

      {/* Menu grid */}
      {!itemsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-card border border-sea-100 overflow-hidden group"
            >
              <div className="relative h-40 bg-sea-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-sea-200" />
                  </div>
                )}
                {!item.is_available && (
                  <div className="absolute inset-0 bg-sea-900/50 flex items-center justify-center">
                    <span className="text-white font-medium">Hết hàng</span>
                  </div>
                )}
                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenVariants(item)}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-sea-50"
                    title="Biến thể (Size)"
                  >
                    <Layers className="w-4 h-4 text-sea-600" />
                  </button>
                  <button
                    onClick={() => handleOpenRecipe(item)}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-sea-50"
                    title="Công thức"
                  >
                    <BookOpen className="w-4 h-4 text-sea-600" />
                  </button>
                  <button
                    onClick={() => handleOpenEditItem(item)}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-sea-50"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4 text-sea-600" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-crimson-50"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4 text-crimson-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-sea-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-sea-500">
                      {item.category_name || "Chưa phân loại"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                      item.is_available
                        ? "bg-green-100 text-green-700"
                        : "bg-sea-100 text-sea-500"
                    }`}
                  >
                    {item.is_available ? "Còn hàng" : "Hết"}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-sea-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="mt-2 text-lg font-bold text-coral-600">
                  {Number(item.price).toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!itemsLoading && items.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-sea-200 mx-auto mb-3" />
          <p className="text-sea-500">Không tìm thấy món ăn nào</p>
          <button
            onClick={handleOpenCreateItem}
            className="mt-3 text-sm text-sea-500 hover:text-sea-700 underline"
          >
            Thêm món đầu tiên
          </button>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-sea-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-sea-800">Xác nhận xóa</h3>
            <p className="text-sm text-sea-600">
              Bạn có chắc muốn xóa món <strong>{deleteConfirm.name}</strong>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-sea-100 text-sea-700 rounded-lg font-medium hover:bg-sea-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-crimson-500 text-white rounded-lg font-medium hover:bg-crimson-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Modal tạo/sửa món */}
      <MenuItemFormModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        item={editingItem}
        categories={categories}
        onSubmit={handleSubmitItem}
        mode={itemModalMode}
      />

      {/* Modal quản lý danh mục */}
      <CategoryManagerModal
        open={catModalOpen}
        onOpenChange={setCatModalOpen}
        categories={categories}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />

      {/* Modal công thức */}
      <RecipeModal
        open={recipeModalOpen}
        onOpenChange={setRecipeModalOpen}
        menuItem={recipeItem}
        recipe={recipe}
        allIngredients={allIngredients}
        loading={recipeLoading}
        onSetRecipe={setRecipe}
        onRemoveItem={removeRecipeItem}
      />

      {/* Modal biến thể (size) */}
      <VariantManagerModal
        open={variantModalOpen}
        onOpenChange={setVariantModalOpen}
        menuItem={variantItem}
        variants={variants}
        loading={variantLoading}
        onCreate={createVariant}
        onUpdate={updateVariant}
        onDelete={deleteVariant}
      />
    </div>
  );
}

export default Menu;
