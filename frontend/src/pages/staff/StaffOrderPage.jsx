import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  ChefHat,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useStaffMenu } from "../../hooks/staff/useStaffMenu";
import { useStaffCart } from "../../hooks/staff/useStaffCart";
import MenuPanel from "../../components/staff/MenuPanel";
import CartPanel from "../../components/staff/CartPanel";
import * as staffService from "../../services/staff.service";

const ITEM_STATUS = {
  preparing: { label: "Đang nấu", color: "text-amber-600", icon: ChefHat },
  served: { label: "Đã lên", color: "text-emerald-600", icon: CheckCircle2 },
  cancelled: { label: "Đã huỷ", color: "text-red-500", icon: XCircle },
};

export default function StaffOrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [tableName, setTableName] = useState("");
  const [existingItems, setExistingItems] = useState([]);
  const [showExisting, setShowExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Hooks
  const menu = useStaffMenu();
  const cart = useStaffCart();

  // Lấy thông tin chi tiết bàn (tên + món đã đặt)
  useEffect(() => {
    staffService
      .getTableDetail(tableId)
      .then((res) => {
        const data = res.data;
        setTableName(data.table_name || `Bàn #${tableId}`);
        // Gom tất cả items (trừ cancelled) từ các orders
        const items = (data.orders || [])
          .flatMap((o) => o.items || [])
          .filter((i) => i.status !== "cancelled");
        setExistingItems(items);
      })
      .catch(() => {
        setTableName(`Bàn #${tableId}`);
      });
  }, [tableId]);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Gửi order
  const handleSubmit = async () => {
    if (cart.cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = cart.toOrderPayload();
      await staffService.createOrder(tableId, payload);
      cart.clearCart();
      setToast({ type: "success", message: "Đã gửi order thành công!" });
      // Quay lại sơ đồ bàn sau 1.5s
      setTimeout(() => navigate("/staff"), 1500);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Gửi order thất bại!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate("/staff")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-sea-700" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Đặt món</h1>
            <p className="text-xs text-slate-500">{tableName}</p>
          </div>
        </div>
      </header>

      {/* ── Existing items banner ──────────────────────── */}
      {existingItems.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 shrink-0">
          <button
            onClick={() => setShowExisting(!showExisting)}
            className="w-full px-4 py-2.5 flex items-center justify-between"
          >
            <span className="text-xs font-semibold text-amber-700">
              Bàn đã có {existingItems.length} món đang phục vụ
            </span>
            {showExisting ? (
              <ChevronUp className="w-4 h-4 text-amber-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-500" />
            )}
          </button>
          {showExisting && (
            <div className="px-4 pb-3 space-y-1.5">
              {existingItems.map((item) => {
                const st = ITEM_STATUS[item.status] || ITEM_STATUS.preparing;
                const StIcon = st.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 truncate flex-1">
                      {item.menu_item_name} x{item.quantity}
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 ${st.color} font-medium`}
                    >
                      <StIcon className="w-3 h-3" />
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Body: Menu (left) + Cart (right) ───────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu panel — 60% */}
        <div className="flex-[3] overflow-y-auto border-r border-slate-200 bg-white">
          <MenuPanel
            categories={menu.categories}
            items={menu.items}
            search={menu.search}
            onSearchChange={menu.setSearch}
            selectedCategory={menu.selectedCategory}
            onCategoryChange={menu.setSelectedCategory}
            onAddToCart={cart.addToCart}
            loading={menu.loading}
          />
        </div>

        {/* Cart panel — 40% */}
        <div className="flex-[2] bg-slate-50 flex flex-col">
          <CartPanel
            cartItems={cart.cartItems}
            totalAmount={cart.totalAmount}
            totalItems={cart.totalItems}
            onUpdateQuantity={cart.updateQuantity}
            onUpdateNote={cart.updateNote}
            onRemoveFromCart={cart.removeFromCart}
            onClearCart={cart.clearCart}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            tableName={tableName}
          />
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 transition-all animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
