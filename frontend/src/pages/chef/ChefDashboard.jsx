import { useEffect, useState } from "react";
import { Users, Clock, Play, Check, RotateCcw, X } from "lucide-react";
import { useSupabaseRealtime } from "../../hooks/shared/useSupabaseRealtime";
import * as staffService from "../../services/staff.service";

const KITCHEN_SUBSCRIPTIONS = [{ table: "order_items", event: "*" }];
const DELIVERY_STORAGE_KEY = "chefLatestDelivered";
const CANCEL_REASONS = [
  "Khách đổi ý",
  "Món có vấn đề",
  "Hết nguyên liệu",
  "Đặt nhầm",
  "Chờ quá lâu",
];

function formatElapsed(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getElapsedSeconds(createdAt, now) {
  if (!createdAt) return 0;
  const createdAtMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return 0;
  return Math.max(0, Math.floor((now - createdAtMs) / 1000));
}

function getOrderTimer(order, now) {
  return formatElapsed(getElapsedSeconds(order.createdAt, now));
}

function saveDeliveryNotification(entry) {
  try {
    window.localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(entry));
    window.dispatchEvent(
      new CustomEvent("latestDeliveredUpdated", { detail: entry }),
    );
  } catch {
    // Ignore storage errors.
  }
}

function normalizeOrder(order) {
  return {
    id: order.id,
    table: order.table,
    createdAt: order.created_at || order.createdAt,
    note: order.note || null,
    itemIds: order.item_ids || order.itemIds || [],
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
        id: item.id,
        qty: item.qty ?? item.quantity ?? 0,
        name: item.name ?? item.menu_item_name ?? "",
        note: item.note ?? item.item_note ?? null,
        status: item.status ?? item.item_status ?? null,
      }))
      : [],
  };
}

function transformBoard(board) {
  const sortByCreatedAt = (left, right) => {
    const leftMs = new Date(left.createdAt).getTime();
    const rightMs = new Date(right.createdAt).getTime();
    return leftMs - rightMs;
  };

  const pendingOrders = Array.isArray(board?.pendingOrders)
    ? board.pendingOrders.map(normalizeOrder).sort(sortByCreatedAt)
    : [];
  const cookingOrders = Array.isArray(board?.cookingOrders)
    ? board.cookingOrders.map(normalizeOrder).sort(sortByCreatedAt)
    : [];
  const completedOrders = Array.isArray(board?.completedOrders)
    ? board.completedOrders.map(normalizeOrder).sort(sortByCreatedAt)
    : [];

  const batching = Array.isArray(board?.batching)
    ? board.batching.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image || null,
      qty: Number(item.qty || 0),
      orderCount: Number(item.orderCount || 0),
      lastOrderAt: item.lastOrderAt || null,
    }))
    : [];

  return { pendingOrders, cookingOrders, completedOrders, batching };
}

function OrderItem({
  item,
  status,
  onCancel,
  onStart,
  onUndo,
  onComplete,
  onDeliver,
}) {
  const itemStatus = item.status || status;
  const actionButtonBase =
    "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors";

  const renderActions = () => {
    if (itemStatus === "preparing") {
      return (
        <>
          <button
            className={`${actionButtonBase} border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-600`}
            aria-label="Hủy món"
            onClick={() => onCancel?.(item)}
          >
            <X size={14} />
          </button>
          <button
            className={`${actionButtonBase} border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:text-emerald-700`}
            aria-label="Bắt đầu nấu"
            onClick={() => onStart?.(item)}
          >
            <Play size={14} />
          </button>
        </>
      );
    }

    if (itemStatus === "cooking") {
      return (
        <>
          <button
            className={`${actionButtonBase} border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-600`}
            aria-label="Hoàn tác"
            onClick={() => onUndo?.(item, "cooking")}
          >
            <RotateCcw size={14} />
          </button>
          <button
            className={`${actionButtonBase} border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:text-emerald-700`}
            aria-label="Hoàn thành"
            onClick={() => onComplete?.(item)}
          >
            <Check size={14} />
          </button>
        </>
      );
    }

    if (itemStatus === "cooked") {
      return (
        <>
          <button
            className={`${actionButtonBase} border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-600`}
            aria-label="Hoàn tác"
            onClick={() => onUndo?.(item, "cooked")}
          >
            <RotateCcw size={14} />
          </button>
          <button
            className={`${actionButtonBase} border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:text-emerald-700`}
            aria-label="Giao món"
            onClick={() => onDeliver?.(item)}
          >
            <Check size={14} />
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <div className="py-2 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-7 text-[12px] text-slate-500 font-semibold">
            {String(item.qty).padStart(2, "0")}
          </span>
          <span className="text-sm font-semibold text-slate-900 truncate">
            {item.name}
          </span>
        </div>
        {item.note && (
          <div className="mt-1 flex items-start gap-1 text-sm text-slate-500 italic">
            <span className="text-slate-400">📝</span>
            <span className="break-words">{item.note}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {renderActions()}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  status,
  now,
  onItemCancel,
  onItemStart,
  onItemComplete,
  onItemDeliver,
  onItemUndo,
  onStartAll,
}) {
  const items = Array.isArray(order?.items)
    ? order.items.filter((item) => item && item.name)
    : [];

  if (items.length === 0) return null;

  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );
  const orderTime = new Date(order.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hasStartable = items.some(
    (item) => (item.status || status) === "preparing",
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900">{order.table}</h3>
        <span className="text-sm font-semibold text-slate-500">
          {orderTime}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <OrderItem
            key={item.id}
            item={item}
            status={status}
            onCancel={onItemCancel}
            onStart={(target) => onItemStart?.(order, target)}
            onUndo={(target, from) => onItemUndo?.(order, target, from)}
            onComplete={(target) => onItemComplete?.(order, target)}
            onDeliver={(target) => onItemDeliver?.(order, target)}
          />
        ))}
      </div>

      {order.note && (
        <div className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-semibold mt-3">
          {order.note}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{totalItems} món</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{getOrderTimer(order, now)}</span>
          </div>
        </div>
        <button
          className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${hasStartable
              ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              : "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
            }`}
          disabled={!hasStartable}
          onClick={() => onStartAll?.(order, items)}
        >
          Bắt đầu nấu tất cả
        </button>
      </div>
    </div>
  );
}

function ChefDashboard() {
  const [board, setBoard] = useState({
    pendingOrders: [],
    cookingOrders: [],
    completedOrders: [],
    batching: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [notification, setNotification] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffService.getKitchenBoard();
      setBoard(transformBoard(res.data));
    } catch (err) {
      setError(err.response?.data?.error || "Không thể tải dữ liệu bếp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  useSupabaseRealtime("chef-kitchen-board", KITCHEN_SUBSCRIPTIONS, () => {
    fetchBoard();
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notification) return undefined;

    const timeout = window.setTimeout(() => {
      setNotification(null);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [notification]);

  useEffect(() => {
    let timeoutId;

    const scheduleMidnightRefresh = () => {
      const nowTime = new Date();
      const nextMidnight = new Date(nowTime);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 2, 0);

      timeoutId = window.setTimeout(() => {
        fetchBoard();
        scheduleMidnightRefresh();
      }, nextMidnight.getTime() - nowTime.getTime());
    };

    scheduleMidnightRefresh();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const showNotification = (message) => {
    setNotification(message);
  };

  const handleOpenRejectModal = (item) => {
    if (!item?.id) return;
    setCancelTarget({ id: item.id, name: item.name || "món ăn" });
    setSelectedReason("");
    setCustomReason("");
    setCancelError(null);
  };

  const handleCloseRejectModal = () => {
    setCancelTarget(null);
    setSelectedReason("");
    setCustomReason("");
    setCancelError(null);
  };

  const markItem = async (itemId, action) => {
    if (!itemId) {
      throw new Error("Không tìm thấy món trong đơn này.");
    }

    const actionFn =
      action === "cooking"
        ? staffService.markItemCooking
        : action === "serving"
          ? staffService.markItemServing
          : staffService.markItemReady;

    await actionFn(itemId);
  };

  const undoItem = async (itemId, action) => {
    if (!itemId) {
      throw new Error("Không tìm thấy món trong đơn này.");
    }

    const actionFn =
      action === "revert-pending"
        ? staffService.revertItemToPreparing
        : staffService.revertItemToCooking;

    await actionFn(itemId);
  };

  const handleStartItem = async (order, item) => {
    try {
      await markItem(item.id, "cooking");
      showNotification(`${order.table} nhận ${item.name}.`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể bắt đầu món",
      );
    }
  };

  const handleCompleteItem = async (order, item) => {
    try {
      await markItem(item.id, "cooked");
      showNotification(`${order.table} đã xong ${item.name}.`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể hoàn thành món",
      );
    }
  };

  const handleUndoItem = async (order, item, from) => {
    try {
      await undoItem(
        item.id,
        from === "cooking" ? "revert-pending" : "revert-cooking",
      );

      showNotification(
        from === "cooking"
          ? `${order.table} đã hoàn tác ${item.name}, quay về chờ nấu.`
          : `${order.table} đã hoàn tác ${item.name}, quay về đang nấu.`,
      );
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể hoàn tác món",
      );
    }
  };

  const handleDeliverItem = async (order, item) => {
    try {
      await markItem(item.id, "serving");

      const deliveredEntry = {
        id: `${order.id}-${item.id}-${Date.now()}`,
        orderId: order.id,
        table: order.table,
        quantity: Number(item.qty || 0),
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        date: new Date().toISOString().slice(0, 10),
      };

      saveDeliveryNotification(deliveredEntry);
      showNotification(`Đã bàn giao ${item.name} (${order.table}).`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Không thể ghi nhận bàn giao",
      );
    }
  };

  const handleStartAll = async (order, items) => {
    const startableItems = items.filter(
      (item) => (item.status || "preparing") === "preparing",
    );

    if (startableItems.length === 0) {
      return;
    }

    try {
      await Promise.all(
        startableItems.map((item) => markItem(item.id, "cooking")),
      );
      showNotification(`${order.table} bắt đầu nấu tất cả món.`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể bắt đầu món",
      );
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget?.id) return;
    const reason =
      selectedReason === "__custom" ? customReason.trim() : selectedReason;

    if (!reason) {
      setCancelError("Vui lòng chọn lý do hủy món.");
      return;
    }

    setCancelling(true);
    setCancelError(null);
    try {
      await staffService.cancelItem(cancelTarget.id, reason);
      showNotification(`Đã hủy ${cancelTarget.name}.`);
      handleCloseRejectModal();
      await fetchBoard();
    } catch (err) {
      setCancelError(
        err.response?.data?.error || err.message || "Không thể hủy món",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="p-4">
      {notification && (
        <div className="fixed top-4 right-4 z-40 max-w-xs rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-md shadow-slate-200/70 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[12px] font-bold shrink-0">
            ✓
          </div>
          <p className="text-[12px] leading-4 font-semibold text-emerald-700">
            {notification}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-100 rounded-2xl p-4 min-h-[524px] max-h-[524px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            <h2 className="font-bold text-blue-600">CHỜ NẤU</h2>

            <span className="bg-blue-100 text-blue-600 px-2 rounded-full text-sm font-bold">
              {board.pendingOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {board.pendingOrders.length === 0 ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-xl">
                  🍳
                </div>
                <div>{loading ? "Đang tải..." : "Trống"}</div>
              </div>
            ) : (
              board.pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  status="pending"
                  now={now}
                  onItemCancel={handleOpenRejectModal}
                  onItemStart={handleStartItem}
                  onItemComplete={handleCompleteItem}
                  onItemDeliver={handleDeliverItem}
                  onItemUndo={handleUndoItem}
                  onStartAll={handleStartAll}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 min-h-[524px] max-h-[524px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            <h2 className="font-bold text-orange-500">ĐANG NẤU</h2>

            <span className="bg-orange-100 text-orange-500 px-2 rounded-full text-sm font-bold">
              {board.cookingOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {board.cookingOrders.length === 0 ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-xl">
                  🍳
                </div>
                <div>Trống</div>
              </div>
            ) : (
              board.cookingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  status="cooking"
                  now={now}
                  onItemCancel={handleOpenRejectModal}
                  onItemStart={handleStartItem}
                  onItemComplete={handleCompleteItem}
                  onItemDeliver={handleDeliverItem}
                  onItemUndo={handleUndoItem}
                  onStartAll={handleStartAll}
                />
              ))
            )}
          </div>
        </div>
      </div>



      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Hủy món: {cancelTarget.name}
              </h3>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                onClick={handleCloseRejectModal}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-4 py-4 space-y-3">
              <p className="text-xs text-slate-500">
                Chọn lý do để ghi nhận hủy món.
              </p>

              <div className="flex flex-wrap gap-2">
                {CANCEL_REASONS.map((reason) => (
                  <button
                    key={reason}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedReason === reason
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    {reason}
                  </button>
                ))}
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedReason === "__custom"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  onClick={() => setSelectedReason("__custom")}
                >
                  Lý do khác
                </button>
              </div>

              {selectedReason === "__custom" && (
                <input
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Nhập lý do hủy..."
                  value={customReason}
                  onChange={(event) => setCustomReason(event.target.value)}
                />
              )}

              {cancelError && (
                <p className="text-xs text-rose-500 font-semibold">
                  {cancelError}
                </p>
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                className="h-9 px-4 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:border-slate-300"
                onClick={handleCloseRejectModal}
              >
                Hủy bỏ
              </button>
              <button
                className={`h-9 px-4 rounded-xl text-xs font-semibold border transition-colors ${cancelling
                    ? "bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-rose-600 text-white border-rose-600 hover:bg-rose-500"
                  }`}
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChefDashboard;
