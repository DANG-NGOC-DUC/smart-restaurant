import { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  ConciergeBell,
  Check,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { usePendingItems } from "../../context/PendingItemsContext";

const CANCEL_REASONS = [
  "Khách đổi ý",
  "Món có vấn đề",
  "Hết nguyên liệu",
  "Đặt nhầm",
  "Chờ quá lâu",
];

const DELIVERY_STORAGE_KEY = "chefLatestDelivered";

function readLatestDelivered() {
  try {
    const raw = window.localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return entry && typeof entry === "object" ? entry : null;
  } catch {
    return null;
  }
}

function ServeFood() {
  const {
    items,
    loading,
    error,
    fetchItems,
    markServed,
    confirmReceive,
    cancelItem,
  } = usePendingItems();
  const [cancelTarget, setCancelTarget] = useState(null); // { id, name }
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [deliveryToast, setDeliveryToast] = useState(null);

  const handleServe = async (itemId) => {
    try {
      await markServed(itemId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmReceive = async (itemId) => {
    try {
      await confirmReceive(itemId);
    } catch (err) {
      alert(err.message);
    }
  };

  const openCancelDialog = (itemId, itemName) => {
    setCancelTarget({ id: itemId, name: itemName });
    setSelectedReason("");
    setCustomReason("");
  };

  const closeCancelDialog = () => {
    setCancelTarget(null);
    setSelectedReason("");
    setCustomReason("");
  };

  const handleConfirmCancel = async () => {
    const reason =
      selectedReason === "__custom" ? customReason.trim() : selectedReason;
    if (!reason) return;

    setCancelling(true);
    try {
      await cancelItem(cancelTarget.id, reason);
      closeCancelDialog();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const applyEntry = (entry) => {
      if (!entry) return;
      setDeliveryToast({
        id: `${entry.orderId || entry.table || "delivery"}-${entry.time || Date.now()}`,
        message: `Bếp vừa giao ${entry.table} · ${entry.quantity} phần`,
      });
    };

    const syncFromStorage = () => {
      applyEntry(readLatestDelivered());
    };

    syncFromStorage();

    const onStorage = (event) => {
      if (event?.key && event.key !== DELIVERY_STORAGE_KEY) return;
      syncFromStorage();
      fetchItems();
    };

    const onCustom = (event) => {
      applyEntry(event?.detail);
      fetchItems();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("latestDeliveredUpdated", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("latestDeliveredUpdated", onCustom);
    };
  }, []);

  useEffect(() => {
    if (!deliveryToast) return undefined;

    const timer = window.setTimeout(() => {
      setDeliveryToast(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [deliveryToast]);

  // Loading
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Đang tải danh sách món...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertTriangle className="w-8 h-8 mb-3 text-coral-500" />
        <p className="text-sm text-slate-600 mb-3">{error}</p>
        <button
          onClick={fetchItems}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sea-700 bg-sea-50 rounded-lg hover:bg-sea-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    );
  }

  // Empty
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <ConciergeBell className="w-12 h-12 mb-4 text-sea-300" />
        <h2 className="text-lg font-semibold text-slate-600 mb-2">
          Không có món chờ phục vụ
        </h2>
        <p className="text-sm text-center px-8">
          Các món đã nấu xong sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  // Gom items theo bàn
  const groupedByTable = items.reduce((acc, item) => {
    const key = item.table_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const tableGroups = Object.entries(groupedByTable);

  return (
    <div className="p-4 space-y-4">
      {deliveryToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-lg shadow-slate-200/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
              ✓
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Thông báo từ bếp
              </p>
              <p className="text-xs text-slate-600">{deliveryToast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header summary */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-700">
          {items.length} món chờ phục vụ · {tableGroups.length} bàn
        </h2>
        <button
          onClick={fetchItems}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Items grouped by table */}
      {tableGroups.map(([tableName, tableItems]) => (
        <div
          key={tableName}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Table header */}
          <div className="px-4 py-2.5 bg-sea-50/50 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sea-600" />
            <span className="font-semibold text-sm text-slate-900">
              {tableName}
            </span>
            <span className="text-xs text-slate-400 ml-auto">
              {tableItems.length} món
            </span>
          </div>

          {/* Items in this table */}
          <div className="divide-y divide-slate-100">
            {tableItems.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">
                    {item.menu_item_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">
                      x{item.quantity}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="w-3 h-3" />
                      {item.waiting_minutes} phút
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-slate-400 mt-1 truncate italic">
                      "{item.note}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() =>
                      openCancelDialog(item.id, item.menu_item_name)
                    }
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 active:scale-95 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Huỷ</span>
                  </button>
                  {item.status === "serving" ? (
                    <button
                      onClick={() => handleConfirmReceive(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-sea-600 text-white text-xs font-semibold rounded-lg hover:bg-sea-700 active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xác nhận nhận món</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleServe(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-sea-600 text-white text-xs font-semibold rounded-lg hover:bg-sea-700 active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã lên</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Cancel Reason Modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={closeCancelDialog}
        >
          <div
            className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-base text-slate-900">Huỷ món</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {cancelTarget.name} — Chọn lý do huỷ:
              </p>
            </div>

            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setSelectedReason(reason);
                    setCustomReason("");
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedReason === reason
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {reason}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedReason("__custom");
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedReason === "__custom"
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Lý do khác...
              </button>

              {selectedReason === "__custom" && (
                <input
                  type="text"
                  autoFocus
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={closeCancelDialog}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={
                  cancelling ||
                  !selectedReason ||
                  (selectedReason === "__custom" && !customReason.trim())
                }
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {cancelling ? "Đang huỷ..." : "Xác nhận huỷ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServeFood;
