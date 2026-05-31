import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Clock,
  LogOut,
  Bell,
  CookingPot,
  CircleCheckBig,
  Ban,
  CreditCard,
  Receipt,
  Info,
  MoreVertical,
  Armchair,
  Users,
  AlertCircle,
  Loader2,
  X,
  Banknote,
  Smartphone,
  Building2,
  BellRing,
  HandPlatter,
  Check,
  CalendarClock,
  MapPin,
  UserCheck,
  XCircle,
} from "lucide-react";
import * as cashierApi from "../../services/cashier.service";
import { useAuth } from "../../context/AuthContext";

// ═══════════════════════════════════════════════
//  FILTER DEFINITIONS
// ═══════════════════════════════════════════════

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "empty", label: "Đang rảnh" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "serving", label: "Đang phục vụ" },
  { key: "payment", label: "Chờ thanh toán" },
];

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const getStatusLabel = (status) => {
  const map = {
    empty: "Trống",
    serving: "Đang phục vụ",
    payment: "Yêu cầu thanh toán",
  };
  return map[status] || status;
};

const getItemStatusLabel = (status) => {
  const map = {
    pending: "Chờ duyệt",
    preparing: "Đang nấu",
    cooked: "Chờ phục vụ",
    served: "Đã lên",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
};

/** Tính thời gian đã ngồi từ session_started_at */
const getElapsedTime = (startedAt) => {
  if (!startedAt) return "";
  const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const h = String(Math.floor(diff / 3600)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const s = String(diff % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const POS_STYLE = {
  "--pos-bg": "#f6f3ee",
  "--pos-panel": "#ffffff",
  "--pos-ink": "#102b31",
  "--pos-muted": "#5e6d73",
  "--pos-accent": "#1a6b7c",
  "--pos-accent-2": "#f28b6d",
  "--pos-warning": "#f2b255",
  "--pos-ring": "rgba(26, 107, 124, 0.18)",
  "--pos-soft": "#f2f5f4",
  backgroundColor: "#f6f3ee",
  backgroundImage:
    "radial-gradient(60% 60% at 8% 6%, rgba(26, 107, 124, 0.14), transparent 60%), radial-gradient(50% 50% at 92% 0%, rgba(242, 139, 109, 0.18), transparent 60%), linear-gradient(180deg, #f8f6f1 0%, #eef2f2 100%)",
  fontFamily: '"Be Vietnam Pro", "Sora", sans-serif',
  color: "var(--pos-ink)",
};

// ═══════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════

/* ──── Real-time Clock ──── */
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-white/80">
      <Clock size={18} />
      <span className="text-sm font-semibold tabular-nums">
        {time.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>
    </div>
  );
}

/* ──── Item Status Badge ──── */
function ItemStatusBadge({ status }) {
  const styles = {
    pending:
      "bg-orange-50 text-orange-600 border border-orange-200 animate-pulse",
    preparing: "bg-amber-50 text-amber-700 border border-amber-200",
    cooked: "bg-orange-100 text-orange-700 border border-orange-300",
    served: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-50 text-red-500 border border-red-200 line-through",
  };

  const icons = {
    pending: <Clock size={10} />,
    preparing: <CookingPot size={10} />,
    cooked: <CircleCheckBig size={10} />,
    served: <CircleCheckBig size={10} />,
    cancelled: <Ban size={10} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${styles[status] || ""}`}
    >
      {icons[status]}
      {getItemStatusLabel(status)}
    </span>
  );
}

/* ──── Table Card ──── */
function TableCard({ table, isSelected, onClick, delay = 0 }) {
  const {
    name,
    code,
    capacity,
    status,
    session_started_at,
    total_items,
    total_amount,
    pending_orders_count = 0,
  } = table;

  const time = getElapsedTime(session_started_at);

  // Base classes per status
  const statusStyles = {
    empty:
      "bg-[var(--pos-panel)] border border-slate-200 hover:border-slate-300 hover:shadow-md",
    serving:
      "bg-[var(--pos-panel)] border border-[var(--pos-accent)] shadow-sm hover:shadow-md",
    payment: "bg-[#fff3dd] border border-[#f2c27a] shadow-sm hover:shadow-md",
  };

  const selectedRing = isSelected
    ? "ring-2 ring-[var(--pos-ring)] ring-offset-2"
    : "";

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`relative rounded-xl p-4 cursor-pointer transition-all flex flex-col h-[132px] justify-between pos-stagger ${statusStyles[status] || statusStyles.empty} ${selectedRing} hover:-translate-y-0.5`}
    >
      {/* Pending notification bell */}
      {status === "payment" && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1 shadow-sm z-10">
          <Bell size={14} />
        </div>
      )}
      {/* Pending order notification */}
      {pending_orders_count > 0 && status !== "payment" && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-sm z-10 animate-pulse">
          <span className="text-[10px] font-bold">{pending_orders_count}</span>
        </div>
      )}

      {/* Top row */}
      <div className="flex justify-between items-start">
        <span
          className={`font-bold text-sm ${
            status === "serving"
              ? "text-[var(--pos-accent)]"
              : status === "payment"
                ? "text-amber-700"
                : "text-slate-400"
          }`}
        >
          {code}
        </span>

        {status === "empty" && (
          <Armchair size={20} className="text-slate-300" />
        )}
        {status === "serving" && (
          <span className="bg-[color:var(--pos-soft)] text-[var(--pos-accent)] text-[10px] px-2 py-0.5 rounded font-bold">
            Phục vụ
          </span>
        )}
        {status === "payment" && (
          <span className="bg-[#ffe8c4] text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">
            Thanh toán
          </span>
        )}
      </div>

      {/* Center */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800">
          {name || `Bàn ${code}`}
        </h3>
        {status === "empty" ? (
          <span className="text-xs text-slate-400 font-medium">
            {capacity} ghế
          </span>
        ) : status === "payment" ? (
          <span className="text-xs text-amber-700 font-medium">
            Chờ thanh toán
          </span>
        ) : (
          <span className="text-xs text-slate-500 font-medium">{time}</span>
        )}
      </div>

      {/* Bottom row */}
      {status === "empty" ? (
        <div className="w-full h-1 bg-slate-100 rounded-full" />
      ) : (
        <div className="flex justify-between items-center text-xs text-slate-500 border-t pt-2 border-dashed border-slate-200">
          <span>{total_items} món</span>
          <span className="font-bold text-slate-800">
            {formatVND(total_amount)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ──── Filter Bar ──── */
function FilterBar({ active, onChange, counts }) {
  return (
    <div className="px-6 py-3 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        const count = counts[f.key];

        // Specific styles per filter type
        let cls =
          "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border";

        if (isActive) {
          if (f.key === "payment") {
            cls +=
              " bg-[var(--pos-warning)] text-white border-transparent shadow-sm";
          } else if (f.key === "pending") {
            cls += " bg-orange-500 text-white border-transparent shadow-sm";
          } else {
            cls +=
              " bg-[var(--pos-accent)] text-white border-transparent shadow-sm";
          }
        } else {
          if (f.key === "payment") {
            cls +=
              " bg-[#fff7e6] hover:bg-[#ffeccc] text-amber-800 border-[#f2d9ac]";
          } else if (f.key === "pending") {
            cls +=
              " bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200";
          } else {
            cls +=
              " bg-white hover:bg-slate-100 text-[color:var(--pos-muted)] border-slate-200";
          }
        }

        return (
          <button key={f.key} className={cls} onClick={() => onChange(f.key)}>
            {f.label}
            {/* Counts badge */}
            {f.key !== "all" && count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : f.key === "payment"
                      ? "bg-yellow-600 text-white"
                      : f.key === "pending"
                        ? "bg-orange-500 text-white"
                        : "bg-[var(--pos-accent)] text-white"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ──── Order Detail Panel (Right Column) ──── */
function OrderPanel({
  table,
  orderData,
  loadingOrders,
  canViewOrders,
  canApproveOrders,
  canCancelItems,
  canCheckout,
  canPrintBill,
  onApproveOrder,
  onCancelPendingOrder,
  onCancelItem,
  onCheckout,
  onPrintBill,
  actionLoading,
}) {
  if (!canViewOrders) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 px-8">
        <Info size={48} strokeWidth={1.2} />
        <p className="text-center text-sm">
          Bạn chưa được cấp quyền xem đơn hàng.
        </p>
      </div>
    );
  }

  if (!table || table.status === "empty") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 px-8">
        <UtensilsCrossed size={48} strokeWidth={1.2} />
        <p className="text-center text-sm">
          Chọn một bàn đang hoạt động để xem chi tiết đơn hàng
        </p>
      </div>
    );
  }

  if (loadingOrders) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Đang tải đơn hàng...</p>
      </div>
    );
  }

  // Flatten all items from all orders (exclude cancelled for total calc)
  const allOrders = orderData?.orders || [];
  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const allItems = allOrders.flatMap((order) =>
    (order.items || []).map((item) => ({
      ...item,
      orderId: order.id,
      orderStatus: order.status,
    })),
  );

  const activeItems = allItems.filter((i) => i.status !== "cancelled");
  const subtotal = activeItems.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0,
  );
  const vat = Math.round(subtotal * 0.1);
  const discount = 0;
  const grandTotal = subtotal + vat - discount;

  const isPayment = table.status === "payment";
  const isServing = table.status === "serving";

  return (
    <>
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[var(--pos-panel)] shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              {table.name || `Bàn ${table.code}`}
            </h2>
            <span
              className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${
                isPayment
                  ? "bg-[#ffe8c4] text-amber-800"
                  : "bg-[var(--pos-soft)] text-[var(--pos-accent)]"
              }`}
            >
              {getStatusLabel(table.status)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {table.capacity} ghế &bull; {allItems.length} món
          </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Order Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
        {/* Pending Orders — Approve Banner */}
        {pendingOrders.length > 0 && (
          <div className="space-y-3 mb-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-orange-500" />
                    <span className="font-bold text-orange-700 text-sm">
                      Đơn mới chờ xác nhận
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-500 font-medium">
                    {new Date(order.created_at).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-orange-800"
                    >
                      <span>
                        {item.quantity}x {item.menu_item_name}
                        {item.variant_label && (
                          <span className="text-orange-500 text-xs ml-1">
                            ({item.variant_label})
                          </span>
                        )}
                      </span>
                      <span className="font-medium">
                        {formatVND(parseFloat(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onCancelPendingOrder(order.id)}
                    disabled={actionLoading || !canApproveOrders}
                    className={`py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${
                      canApproveOrders
                        ? "bg-red-100 hover:bg-red-200 text-red-700"
                        : "bg-orange-100 text-orange-600 cursor-not-allowed"
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : canApproveOrders ? (
                      <>
                        <X size={16} />
                        Hủy đơn
                      </>
                    ) : (
                      "Chỉ xem"
                    )}
                  </button>
                  <button
                    onClick={() => onApproveOrder(order.id)}
                    disabled={actionLoading || !canApproveOrders}
                    className={`py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${
                      canApproveOrders
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-orange-100 text-orange-600 cursor-not-allowed"
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : canApproveOrders ? (
                      <>
                        <CircleCheckBig size={16} />
                        Xác nhận đơn
                      </>
                    ) : (
                      "Chỉ xem"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {allOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <Receipt size={32} strokeWidth={1.4} />
            <p className="text-sm">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 relative ${
                  item.status === "cancelled" ? "opacity-50" : ""
                }`}
              >
                {/* Qty box */}
                <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-slate-500 font-bold text-sm">
                    {item.quantity}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4
                      className={`font-bold text-sm truncate ${
                        item.status === "cancelled"
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {item.menu_item_name}
                    </h4>
                    <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                      {formatVND(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                  {item.variant_label && (
                    <p className="text-[11px] text-[var(--pos-accent)] font-medium mt-0.5">
                      {item.variant_label}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.note}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <ItemStatusBadge status={item.status} />
                    {/* Nút hủy món — chỉ hiện khi đang nấu hoặc đã nấu */}
                    {canCancelItems &&
                      (item.status === "preparing" ||
                        item.status === "cooked") && (
                        <button
                          onClick={() => onCancelItem(item.id)}
                          disabled={actionLoading}
                          className="ml-auto text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          title="Hủy món"
                        >
                          <X size={14} />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary & Actions */}
      <div className="bg-[var(--pos-soft)] p-5 border-t border-slate-200 shrink-0">
        {/* Price summary */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Tạm tính</span>
            <span className="font-medium text-slate-700">
              {formatVND(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>VAT (10%)</span>
            <span className="font-medium text-slate-700">{formatVND(vat)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Giảm giá</span>
            <span className="font-medium text-slate-700">
              -{formatVND(discount)}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-base text-slate-800">
              Tổng phải thu
            </span>
            <span className="font-bold text-2xl text-[var(--pos-accent)]">
              {formatVND(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons — depend on table status */}
        {(isServing || isPayment) && (
          <div className="space-y-2">
            {!canPrintBill && !canCheckout && (
              <p className="text-xs text-slate-500">
                Bạn chưa được cấp quyền thanh toán.
              </p>
            )}
            {(canPrintBill || canCheckout) && (
              <div
                className={`grid gap-3 ${
                  canPrintBill && canCheckout ? "grid-cols-5" : "grid-cols-1"
                }`}
              >
                {canPrintBill && (
                  <button
                    onClick={() =>
                      onPrintBill &&
                      onPrintBill(table, allItems, {
                        subtotal,
                        vat,
                        discount,
                        grandTotal,
                      })
                    }
                    className={`${
                      canCheckout ? "col-span-2" : "col-span-1"
                    } py-3 px-3 rounded-xl bg-[var(--pos-panel)] text-[var(--pos-ink)] font-bold text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 border border-slate-200`}
                  >
                    <Receipt size={16} />
                    In tạm tính
                  </button>
                )}
                {canCheckout && (
                  <button
                    onClick={() => onCheckout(table.id)}
                    disabled={actionLoading}
                    className={`${
                      canPrintBill ? "col-span-3" : "col-span-1"
                    } py-3 px-4 rounded-xl bg-[var(--pos-accent)] text-white font-bold text-sm shadow-md shadow-[#1a6b7c]/30 hover:shadow-lg hover:bg-[#155e6d] transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                  >
                    {actionLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Thanh toán
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
//  PAYMENT METHOD MODAL
// ═══════════════════════════════════════════════

const PAYMENT_METHODS = [
  { key: "cash", label: "Tiền mặt", icon: Banknote, color: "bg-emerald-500" },
  {
    key: "transfer",
    label: "Chuyển khoản",
    icon: Building2,
    color: "bg-blue-500",
  },
  { key: "momo", label: "MoMo", icon: Smartphone, color: "bg-pink-500" },
];

function PaymentModal({ open, table, total, loading, onConfirm, onClose }) {
  const [method, setMethod] = useState("cash");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--pos-panel)] rounded-2xl shadow-2xl w-[420px] max-w-[90vw] overflow-hidden">
        {/* Header */}
        <div className="bg-[color:var(--pos-ink)] px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Thanh toán</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Table & Total */}
        <div className="px-6 pt-5 pb-3 text-center border-b border-slate-100">
          <p className="text-slate-500 text-sm">{table?.name || "Bàn"}</p>
          <p className="text-3xl font-bold text-[var(--pos-accent)] mt-1">
            {formatVND(total)}
          </p>
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Phương thức thanh toán
          </p>
          {PAYMENT_METHODS.map((pm) => {
            const Icon = pm.icon;
            const isActive = method === pm.key;
            return (
              <button
                key={pm.key}
                onClick={() => setMethod(pm.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[var(--pos-accent)] bg-[var(--pos-soft)] shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`${pm.color} p-2 rounded-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span
                  className={`font-bold text-sm ${
                    isActive ? "text-[var(--pos-accent)]" : "text-slate-700"
                  }`}
                >
                  {pm.label}
                </span>
                {isActive && (
                  <CircleCheckBig
                    size={18}
                    className="ml-auto text-[var(--pos-accent)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <div className="px-6 pb-5">
          <button
            onClick={() => onConfirm(method)}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--pos-accent)] text-white font-bold text-sm shadow-md hover:bg-[#155e6d] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <CreditCard size={18} />
                Xác nhận thanh toán
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SERVICE REQUESTS PANEL
// ═══════════════════════════════════════════════

const REQUEST_TYPE_MAP = {
  call_waiter: {
    label: "Gọi phục vụ",
    icon: BellRing,
    color: "text-blue-600 bg-blue-50",
  },
  request_bill: {
    label: "Yêu cầu tính tiền",
    icon: Receipt,
    color: "text-yellow-700 bg-yellow-50",
  },
  add_ice: {
    label: "Thêm đá",
    icon: HandPlatter,
    color: "text-cyan-600 bg-cyan-50",
  },
};

function ServiceRequestsPanel({ requests, loading, onResolve, canResolve }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-1">
        <Bell size={24} strokeWidth={1.4} />
        <p className="text-xs">Không có yêu cầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto px-1">
      {requests.map((req) => {
        const typeInfo =
          REQUEST_TYPE_MAP[req.request_type] || REQUEST_TYPE_MAP.call_waiter;
        const Icon = typeInfo.icon;
        const waitMins = Math.floor(
          (Date.now() - new Date(req.created_at).getTime()) / 60000,
        );

        return (
          <div
            key={req.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-slate-100 shadow-sm"
          >
            <div className={`p-1.5 rounded-lg ${typeInfo.color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">
                {req.table_name || `Bàn ${req.table_code}`}
              </p>
              <p className="text-[10px] text-slate-400">
                {typeInfo.label} •{" "}
                {waitMins > 0 ? `${waitMins} phút trước` : "Vừa xong"}
              </p>
            </div>
            {canResolve ? (
              <button
                onClick={() => onResolve(req.id)}
                className="shrink-0 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-1.5 rounded-lg transition-colors"
                title="Xử lý xong"
              >
                <Check size={14} />
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Chỉ xem</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  RESERVATION PANEL
// ═══════════════════════════════════════════════

function ReservationPanel({
  reservations,
  tables,
  loading,
  onConfirm,
  onReject,
  actionLoading,
  canConfirm,
  canReject,
}) {
  const [assignTableId, setAssignTableId] = useState({});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-1">
        <CalendarClock size={24} strokeWidth={1.4} />
        <p className="text-xs">Không có yêu cầu đặt bàn</p>
      </div>
    );
  }

  const emptyTables = tables.filter((t) => t.status === "empty");

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto px-1">
      {reservations.map((r) => {
        const date = new Date(r.reserved_at);
        const waitMins = Math.max(
          0,
          Math.floor((date.getTime() - Date.now()) / 60000),
        );
        const isPast = waitMins <= 0;

        return (
          <div
            key={r.id}
            className={`rounded-xl border p-4 shadow-sm ${
              r.status === "pending"
                ? "bg-orange-50 border-orange-200"
                : "bg-emerald-50 border-emerald-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-sm text-slate-800">
                  {r.customer_name || r.customer_email || "Khách"}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarClock size={12} />
                    {date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    {date.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {r.guest_count || 2}
                  </span>
                </div>
                {r.customer_phone && (
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">
                      call
                    </span>
                    {r.customer_phone}
                  </p>
                )}
                {r.note && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    📝 {r.note}
                  </p>
                )}
              </div>
              <span
                className={`text-[10px] px-2 py-1 rounded-full font-bold shrink-0 ${
                  r.status === "pending"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {r.status === "pending"
                  ? isPast
                    ? "Quá giờ"
                    : `${waitMins}p nữa`
                  : "Đã xác nhận"}
              </span>
            </div>

            {/* Actions for pending */}
            {r.status === "pending" && (
              <div className="mt-3 space-y-2">
                {/* Table assignment */}
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <select
                    value={assignTableId[r.id] || ""}
                    onChange={(e) =>
                      setAssignTableId((prev) => ({
                        ...prev,
                        [r.id]: e.target.value,
                      }))
                    }
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                  >
                    <option value="">Chọn bàn (tùy chọn)</option>
                    {emptyTables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || `Bàn ${t.code}`} ({t.capacity} ghế)
                      </option>
                    ))}
                  </select>
                </div>
                {/* Buttons */}
                <div className="flex gap-2">
                  {canConfirm && (
                    <button
                      onClick={() =>
                        onConfirm(r.id, assignTableId[r.id] || null)
                      }
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      <UserCheck size={14} />
                      Xác nhận
                    </button>
                  )}
                  {canReject && (
                    <button
                      onClick={() => onReject(r.id)}
                      disabled={actionLoading}
                      className="py-2 px-3 rounded-lg bg-white border border-red-200 text-red-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={14} />
                      Từ chối
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Info for confirmed */}
            {r.status === "confirmed" && r.table_name && (
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <MapPin size={12} />
                {r.table_name || `Bàn ${r.table_code}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════

export default function CashierPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const resolvedRole = user?.role || user?.db_role;
  const isAdmin = resolvedRole === "admin";
  const permissionSet = new Set(user?.permissions || []);
  const hasPermission = (key) => isAdmin || permissionSet.has(key);
  const hasCashierPermission = isAdmin
    ? true
    : Array.from(permissionSet).some((permission) =>
        String(permission).startsWith("cashier."),
      );

  const canReadTables = hasPermission("cashier.tables.read");
  const canReadOrders = hasPermission("cashier.orders.read");
  const canApproveOrders = hasPermission("cashier.orders.approve");
  const canCancelItems = hasPermission("cashier.order_items.cancel");
  const canCheckout = hasPermission("cashier.checkout");
  const canReadReservations = hasPermission("cashier.reservations.read");
  const canConfirmReservation = hasPermission("cashier.reservations.confirm");
  const canRejectReservation = hasPermission("cashier.reservations.reject");
  const canReadRequests = hasPermission("cashier.service_requests.read");
  const canResolveRequests = hasPermission("cashier.service_requests.resolve");

  const canViewTables =
    canReadTables ||
    canReadOrders ||
    canApproveOrders ||
    canCancelItems ||
    canCheckout ||
    canReadReservations;
  const canViewOrders =
    canReadOrders || canApproveOrders || canCancelItems || canCheckout;
  const canPrintBill = canReadOrders || canCheckout;

  const displayRole = isAdmin
    ? "Quản lý"
    : hasCashierPermission
      ? "Thu ngân"
      : "Nhân viên";
  const displayName = user?.full_name || user?.email || displayRole;

  // ── State ──
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [orderData, setOrderData] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null); // { tableId, tableName, total }
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("orders");

  // ── Toast helper ──
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch danh sách bàn ──
  const fetchTables = useCallback(async () => {
    if (!canViewTables) {
      setLoadingTables(false);
      return;
    }
    try {
      const res = await cashierApi.getTables();
      setTables(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách bàn:", err);
      showToast("error", "Không thể tải danh sách bàn");
    } finally {
      setLoadingTables(false);
    }
  }, [canViewTables, showToast]);

  // ── Fetch chi tiết đơn hàng khi chọn bàn ──
  const fetchOrders = useCallback(
    async (tableId) => {
      if (!tableId || !canViewOrders) return;
      setLoadingOrders(true);
      try {
        const res = await cashierApi.getTableOrders(tableId);
        setOrderData(res.data);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
        setOrderData(null);
      } finally {
        setLoadingOrders(false);
      }
    },
    [canViewOrders],
  );

  // Load bàn lần đầu + auto-refresh mỗi 10s
  useEffect(() => {
    if (!canViewTables) {
      setTables([]);
      setLoadingTables(false);
      return undefined;
    }
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, [fetchTables, canViewTables]);

  // Load đơn hàng khi chọn bàn khác + auto-refresh mỗi 10s
  useEffect(() => {
    if (!canViewOrders) {
      setOrderData(null);
      setLoadingOrders(false);
      return undefined;
    }
    if (selectedTableId) {
      fetchOrders(selectedTableId);
      const interval = setInterval(() => fetchOrders(selectedTableId), 10000);
      return () => clearInterval(interval);
    }
    setOrderData(null);
    return undefined;
  }, [selectedTableId, fetchOrders, canViewOrders]);

  // ── API 1: Duyệt đơn hàng ──
  const handleApproveOrder = useCallback(
    async (orderId) => {
      if (!canApproveOrders) {
        showToast("error", "Bạn chưa được cấp quyền duyệt đơn.");
        return;
      }
      setActionLoading(true);
      try {
        await cashierApi.approveOrder(orderId);
        showToast("success", "Đã duyệt đơn hàng thành công!");
        // Refresh cả bàn + đơn hàng
        await Promise.all([fetchTables(), fetchOrders(selectedTableId)]);
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi duyệt đơn hàng";
        showToast("error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [selectedTableId, fetchTables, fetchOrders, showToast, canApproveOrders],
  );

  // ── API 1b: Hủy đơn pending ──
  const handleCancelPendingOrder = useCallback(
    async (orderId) => {
      if (!canApproveOrders) {
        showToast("error", "Bạn chưa được cấp quyền hủy đơn.");
        return;
      }
      if (!window.confirm("Hủy đơn này vì không có khách?")) return;
      setActionLoading(true);
      try {
        await cashierApi.cancelPendingOrder(orderId);
        showToast("success", "Đã hủy đơn hàng.");
        await Promise.all([fetchTables(), fetchOrders(selectedTableId)]);
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi hủy đơn hàng";
        showToast("error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [selectedTableId, fetchTables, fetchOrders, showToast, canApproveOrders],
  );

  // ── API 2: Hủy món ──
  const handleCancelItem = useCallback(
    async (itemId) => {
      if (!canCancelItems) {
        showToast("error", "Bạn chưa được cấp quyền hủy món.");
        return;
      }
      if (!window.confirm("Bạn có chắc muốn hủy món này?")) return;
      setActionLoading(true);
      try {
        await cashierApi.cancelOrderItem(itemId);
        showToast("success", "Đã hủy món thành công!");
        await Promise.all([fetchTables(), fetchOrders(selectedTableId)]);
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi hủy món";
        showToast("error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [selectedTableId, fetchTables, fetchOrders, showToast, canCancelItems],
  );

  // ── API 3: Mở modal thanh toán ──
  const handleCheckout = useCallback(
    (tableId) => {
      if (!canCheckout) {
        showToast("error", "Bạn chưa được cấp quyền thanh toán.");
        return;
      }
      const tbl = tables.find((t) => t.id === tableId);
      // Tính tổng từ orderData
      const allOrders = orderData?.orders || [];
      const activeItems = allOrders
        .flatMap((o) => o.items || [])
        .filter((i) => i.status !== "cancelled");
      const subtotal = activeItems.reduce(
        (sum, i) => sum + parseFloat(i.price) * i.quantity,
        0,
      );
      const vat = Math.round(subtotal * 0.1);
      const grandTotal = subtotal + vat;
      setPaymentModal({
        tableId,
        tableName: tbl?.name || `Bàn ${tbl?.code}`,
        total: grandTotal,
      });
    },
    [tables, orderData, canCheckout, showToast],
  );

  // ── API 3b: Xác nhận thanh toán với phương thức ──
  const handleConfirmPayment = useCallback(
    async (paymentMethod) => {
      if (!paymentModal) return;
      if (!canCheckout) {
        showToast("error", "Bạn chưa được cấp quyền thanh toán.");
        return;
      }
      setActionLoading(true);
      try {
        const res = await cashierApi.checkoutTable(
          paymentModal.tableId,
          paymentMethod,
        );
        showToast(
          "success",
          `Thanh toán thành công! Tổng: ${formatVND(res.data.data.invoice.total_amount)}`,
        );
        setPaymentModal(null);
        setSelectedTableId(null);
        setOrderData(null);
        await fetchTables();
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi thanh toán";
        showToast("error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [paymentModal, fetchTables, showToast, canCheckout],
  );

  // ── API 4: Service Requests ──
  const fetchServiceRequests = useCallback(async () => {
    if (!canReadRequests) {
      setServiceRequests([]);
      return;
    }
    try {
      const res = await cashierApi.getServiceRequests();
      setServiceRequests(res.data);
    } catch {
      // ignore
    }
  }, [canReadRequests]);

  const handleResolveRequest = useCallback(
    async (requestId) => {
      if (!canResolveRequests) {
        showToast("error", "Bạn chưa được cấp quyền xử lý yêu cầu.");
        return;
      }
      try {
        await cashierApi.resolveServiceRequest(requestId);
        showToast("success", "Đã xử lý yêu cầu!");
        await Promise.all([fetchServiceRequests(), fetchTables()]);
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi xử lý yêu cầu";
        showToast("error", msg);
      }
    },
    [fetchServiceRequests, fetchTables, showToast, canResolveRequests],
  );

  // Load service requests + auto-refresh
  useEffect(() => {
    if (!canReadRequests) {
      setServiceRequests([]);
      return undefined;
    }
    fetchServiceRequests();
    const interval = setInterval(fetchServiceRequests, 10000);
    return () => clearInterval(interval);
  }, [fetchServiceRequests, canReadRequests]);

  // ── API 5: Reservations ──
  const fetchReservations = useCallback(async () => {
    if (!canReadReservations) {
      setReservations([]);
      return;
    }
    try {
      const res = await cashierApi.getReservations();
      setReservations(res.data);
    } catch {
      // ignore
    }
  }, [canReadReservations]);

  const handleConfirmReservation = useCallback(
    async (id, tableId) => {
      if (!canConfirmReservation) {
        showToast("error", "Bạn chưa được cấp quyền xác nhận đặt bàn.");
        return;
      }
      setActionLoading(true);
      try {
        await cashierApi.confirmReservation(id, tableId);
        showToast("success", "Đã xác nhận đặt bàn!");
        await fetchReservations();
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi xác nhận đặt bàn";
        showToast("error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [fetchReservations, showToast, canConfirmReservation],
  );

  const handleRejectReservation = useCallback(
    async (id) => {
      if (!canRejectReservation) {
        showToast("error", "Bạn chưa được cấp quyền từ chối đặt bàn.");
        return;
      }
      if (!window.confirm("Bạn có chắc muốn từ chối đặt bàn này?")) return;
      setActionLoading(true);
      try {
        await cashierApi.rejectReservation(id);
        showToast("success", "Đã từ chối đặt bàn.");
        await fetchReservations();
      } catch (err) {
        const msg = err.response?.data?.error || "Lỗi khi từ chối đặt bàn";
        showToast("error", msg);
      } finally {
        setActionLoading(false);
      }
    },
    [fetchReservations, showToast, canRejectReservation],
  );

  // Load reservations + auto-refresh
  useEffect(() => {
    if (!canReadReservations) {
      setReservations([]);
      return undefined;
    }
    fetchReservations();
    const interval = setInterval(fetchReservations, 15000);
    return () => clearInterval(interval);
  }, [fetchReservations, canReadReservations]);

  // ── In tạm tính ──
  const handlePrintBill = useCallback((table, items, summary) => {
    const printContent = `
      <html>
      <head>
        <title>Tạm tính - ${table.name || `Bàn ${table.code}`}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 300px; margin: 0 auto; padding: 20px; font-size: 12px; }
          h2 { text-align: center; margin-bottom: 4px; font-size: 16px; }
          .sub { text-align: center; color: #666; margin-bottom: 12px; font-size: 11px; }
          hr { border: none; border-top: 1px dashed #333; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; font-size: 14px; }
          .note { text-align: center; color: #999; margin-top: 12px; font-size: 10px; }
        </style>
      </head>
      <body>
        <h2>SMART RESTAURANT</h2>
        <p class="sub">${table.name || `Bàn ${table.code}`} — ${new Date().toLocaleString("vi-VN")}</p>
        <hr/>
        ${items
          .filter((i) => i.status !== "cancelled")
          .map(
            (i) =>
              `<div class="row"><span>${i.quantity}x ${i.menu_item_name}${i.variant_label ? ` (${i.variant_label})` : ""}</span><span>${new Intl.NumberFormat("vi-VN").format(parseFloat(i.price) * i.quantity)}đ</span></div>`,
          )
          .join("")}
        <hr/>
        <div class="row"><span>Tạm tính</span><span>${new Intl.NumberFormat("vi-VN").format(summary.subtotal)}đ</span></div>
        <div class="row"><span>VAT (10%)</span><span>${new Intl.NumberFormat("vi-VN").format(summary.vat)}đ</span></div>
        <div class="row total"><span>TỔNG CỘNG</span><span>${new Intl.NumberFormat("vi-VN").format(summary.grandTotal)}đ</span></div>
        <hr/>
        <p class="note">Đây là phiếu tạm tính, chưa phải hóa đơn chính thức.</p>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }, []);

  // ── Chốt ca (Logout) ──
  const handleCloseShift = useCallback(() => {
    if (!window.confirm("Bạn có chắc muốn chốt ca và đăng xuất?")) return;
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // ── Computed ──
  const counts = useMemo(() => {
    const c = {
      all: tables.length,
      empty: 0,
      pending: 0,
      serving: 0,
      payment: 0,
    };
    tables.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status]++;
      if (t.pending_orders_count > 0) c.pending++;
    });
    return c;
  }, [tables]);

  const pendingReservationCount = useMemo(
    () => reservations.filter((r) => r.status === "pending").length,
    [reservations],
  );

  const filteredTables = useMemo(() => {
    if (activeFilter === "all") return tables;
    if (activeFilter === "pending")
      return tables.filter((t) => t.pending_orders_count > 0);
    return tables.filter((t) => t.status === activeFilter);
  }, [activeFilter, tables]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <div
      className="h-screen flex flex-col antialiased overflow-hidden"
      style={POS_STYLE}
    >
      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header className="min-h-[64px] bg-[color:var(--pos-ink)] text-white flex items-center justify-between px-6 py-3 shadow-md shrink-0 z-20 flex-wrap gap-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <UtensilsCrossed size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Smart Restaurant
            </h1>
            <p className="text-[11px] text-white/60 uppercase tracking-[0.2em]">
              POS
            </p>
          </div>
        </div>

        {/* Right: Clock, user, close shift */}
        <div className="flex items-center gap-5">
          {/* Reservations badge */}
          {reservations.filter((r) => r.status === "pending").length > 0 && (
            <div className="relative flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <CalendarClock size={16} className="text-[#ffd3a8]" />
              <span className="text-xs font-bold text-[#ffd3a8]">
                {reservations.filter((r) => r.status === "pending").length} đặt
                bàn
              </span>
            </div>
          )}

          {/* Service requests badge */}
          {serviceRequests.length > 0 && (
            <div className="relative flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <BellRing size={16} className="text-[#ffe2a3]" />
              <span className="text-xs font-bold text-[#ffe2a3]">
                {serviceRequests.length} yêu cầu
              </span>
            </div>
          )}

          <LiveClock />

          <div className="h-6 w-px bg-white/20" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold leading-none">{displayName}</p>
              <p className="text-[11px] text-white/60 leading-none mt-1">
                {displayRole}
              </p>
            </div>
            <div className="size-9 rounded-full bg-[var(--pos-accent)] flex items-center justify-center text-white font-bold border-2 border-white/20 text-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {resolvedRole !== "guest" && (
            <button
              onClick={() => navigate("/staff")}
              className="ml-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <UtensilsCrossed size={16} />
              Phục vụ
            </button>
          )}

          <button
            onClick={handleCloseShift}
            className="ml-1 bg-[var(--pos-accent-2)] hover:bg-[#ec7958] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <LogOut size={16} />
            Chốt ca
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex flex-1 overflow-y-auto lg:overflow-hidden flex-col lg:flex-row pos-fade">
        {/* LEFT COLUMN — Table Grid (65%) */}
        <section className="w-full lg:w-[62%] flex flex-col h-auto lg:h-full lg:border-r border-slate-200 bg-transparent min-h-0">
          {canViewTables ? (
            <>
              <FilterBar
                active={activeFilter}
                onChange={setActiveFilter}
                counts={counts}
              />

              <div className="px-6 py-2 bg-white/70 border-b border-slate-100 text-xs text-[color:var(--pos-muted)] flex flex-wrap items-center gap-4">
                <span className="font-semibold">Tổng: {counts.all}</span>
                <span>Rảnh: {counts.empty}</span>
                <span>Chờ duyệt: {counts.pending}</span>
                <span>Đang phục vụ: {counts.serving}</span>
                <span>Chờ thanh toán: {counts.payment}</span>
              </div>
            </>
          ) : (
            <div className="px-6 py-4 bg-white/70 border-b border-slate-100 text-xs text-slate-500">
              Bạn chưa được cấp quyền xem danh sách bàn.
            </div>
          )}

          {/* Table Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {!canViewTables ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Info size={36} />
                <p className="text-sm">Không có quyền xem danh sách bàn.</p>
              </div>
            ) : loadingTables ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Loader2 size={36} className="animate-spin" />
                <p className="text-sm">Đang tải danh sách bàn...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredTables.map((table, index) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      isSelected={selectedTableId === table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      delay={index * 30}
                    />
                  ))}
                </div>

                {filteredTables.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <AlertCircle size={36} strokeWidth={1.4} />
                    <p className="text-sm">Không có bàn nào ở trạng thái này</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN — Order Details + Service Requests (35%) */}
        <aside className="w-full lg:w-[38%] bg-[var(--pos-panel)] shadow-2xl z-10 flex flex-col h-auto lg:h-full min-h-0 pos-rise">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-[var(--pos-soft)]">
            <button
              type="button"
              onClick={() => setRightPanelTab("orders")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                rightPanelTab === "orders"
                  ? "bg-[var(--pos-accent)] text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              Đơn hàng
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab("reservations")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                rightPanelTab === "reservations"
                  ? "bg-[var(--pos-accent)] text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              Đặt bàn
              {pendingReservationCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                  {pendingReservationCount}
                </span>
              )}
            </button>
          </div>

          {rightPanelTab === "orders" && (
            <>
              <OrderPanel
                table={selectedTable}
                orderData={orderData}
                loadingOrders={loadingOrders}
                canViewOrders={canViewOrders}
                canApproveOrders={canApproveOrders}
                canCancelItems={canCancelItems}
                canCheckout={canCheckout}
                canPrintBill={canPrintBill}
                onApproveOrder={handleApproveOrder}
                onCancelPendingOrder={handleCancelPendingOrder}
                onCancelItem={handleCancelItem}
                onCheckout={handleCheckout}
                onPrintBill={handlePrintBill}
                actionLoading={actionLoading}
              />

              {(serviceRequests.length > 0 || canReadRequests) && (
                <div className="border-t border-slate-200 bg-[var(--pos-soft)] px-5 py-3 shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <BellRing size={14} className="text-yellow-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Yêu cầu từ khách ({serviceRequests.length})
                    </span>
                  </div>
                  {canReadRequests ? (
                    <ServiceRequestsPanel
                      requests={serviceRequests}
                      loading={loadingRequests}
                      onResolve={handleResolveRequest}
                      canResolve={canResolveRequests}
                    />
                  ) : (
                    <div className="text-xs text-slate-500">
                      Bạn chưa được cấp quyền xem yêu cầu hỗ trợ.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {rightPanelTab === "reservations" && (
            <div className="flex-1 overflow-y-auto">
              {canReadReservations ? (
                <div className="px-5 py-4">
                  <ReservationPanel
                    reservations={reservations}
                    tables={tables}
                    loading={loadingReservations}
                    onConfirm={handleConfirmReservation}
                    onReject={handleRejectReservation}
                    actionLoading={actionLoading}
                    canConfirm={canConfirmReservation}
                    canReject={canRejectReservation}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <Info size={28} />
                  <p className="text-sm">
                    Bạn chưa được cấp quyền xem đặt bàn.
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        open={!!paymentModal}
        table={{ name: paymentModal?.tableName }}
        total={paymentModal?.total || 0}
        loading={actionLoading}
        onConfirm={handleConfirmPayment}
        onClose={() => setPaymentModal(null)}
      />

      <style>{`
        .pos-stagger { animation: pos-stagger 0.45s ease-out both; }
        .pos-fade { animation: pos-fade 0.35s ease-out both; }
        .pos-rise { animation: pos-rise 0.4s ease-out both; }
        @keyframes pos-stagger {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pos-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pos-rise {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
