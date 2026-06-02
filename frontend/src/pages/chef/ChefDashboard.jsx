import { useEffect, useState } from "react";
import { Users, Clock, Play, Check, RotateCcw } from "lucide-react";
import { useSupabaseRealtime } from "../../hooks/shared/useSupabaseRealtime";
import * as staffService from "../../services/staff.service";

const KITCHEN_SUBSCRIPTIONS = [{ table: "order_items", event: "*" }];
const DELIVERY_STORAGE_KEY = "chefLatestDelivered";

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

function getItemIds(order) {
  if (Array.isArray(order.itemIds) && order.itemIds.length > 0) {
    return order.itemIds;
  }
  return Array.isArray(order.items)
    ? order.items.map((item) => item.id).filter(Boolean)
    : [];
}

function getOrderQuantity(order) {
  return Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + Number(item.qty || 0), 0)
    : 0;
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

function OrderCard({
  order,
  status,
  now,
  onStart,
  onComplete,
  onDeliver,
  onUndo,
}) {
  const timerColor =
    status === "pending"
      ? "text-blue-600"
      : status === "cooking"
        ? "text-orange-500"
        : "text-green-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 h-[205px] flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-extrabold text-[17px] text-slate-800 tracking-tight">
          {order.table}
        </h3>

        <span className={`text-[13px] font-bold ${timerColor}`}>
          {getOrderTimer(order, now)}
        </span>
      </div>

      <div className="text-sm text-slate-700 mb-1.5">
        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-0.5">
          {order.items.map((item, index) => (
            <div key={item.id || index} className="flex items-start gap-2">
              <div className="w-6 text-slate-500 text-[13px] pt-0.5 shrink-0">
                {String(item.qty).padStart(2, "0")}
              </div>
              <div className="flex-1 text-[13px] leading-5">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      {order.note && (
        <div className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-semibold mb-1.5 self-start">
          {order.note}
        </div>
      )}

      <div className="mt-1.5 mt-auto">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Users size={13} />
              <span>{getOrderQuantity(order)} món</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>
                {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="opacity-70" />
        </div>

        {status === "pending" && (
          <button
            className="w-full h-9 rounded-xl border border-blue-200 bg-white/80 text-blue-600 font-medium flex items-center justify-center gap-2 text-[13px] shadow-sm transition-all duration-150 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
            onClick={() => onStart(order)}
          >
            <Play size={14} />
            Bắt đầu
          </button>
        )}

        {status === "cooking" && (
          <div className="flex items-center gap-2.5">
            <button
              className="flex-1 h-9 rounded-xl border border-orange-200 bg-white/80 text-orange-500 text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-orange-50 hover:border-orange-300 hover:shadow-md"
              onClick={() => onUndo(order, "cooking")}
            >
              <RotateCcw size={13} className="inline mr-1.5" />
              Hoàn tác
            </button>

            <button
              className="flex-1 h-9 rounded-xl bg-green-600 text-white text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-green-500 hover:shadow-md"
              onClick={() => onComplete(order)}
            >
              <Check size={13} className="inline mr-1.5" />
              Hoàn thành
            </button>
          </div>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-2.5">
            <button
              className="flex-1 h-9 rounded-xl border border-orange-200 bg-white/80 text-orange-500 text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-orange-50 hover:border-orange-300 hover:shadow-md"
              onClick={() => onUndo(order, "completed")}
            >
              <RotateCcw size={13} className="inline mr-1.5" />
              Hoàn tác
            </button>

            <button
              className="flex-1 h-9 rounded-xl bg-green-600 text-white text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-green-500 hover:shadow-md"
              onClick={() => onDeliver(order)}
            >
              Giao
            </button>
          </div>
        )}
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

  const markOrderItems = async (order, action) => {
    const itemIds = getItemIds(order);
    if (itemIds.length === 0) {
      throw new Error("Không tìm thấy món trong đơn này.");
    }

    const actionFn =
      action === "cooking"
        ? staffService.markItemCooking
        : action === "serving"
          ? staffService.markItemServing
          : staffService.markItemReady;

    await Promise.all(itemIds.map((itemId) => actionFn(itemId)));
  };

  const undoOrderItems = async (order, action) => {
    const itemIds = getItemIds(order);
    if (itemIds.length === 0) {
      throw new Error("Không tìm thấy món trong đơn này.");
    }

    const actionFn =
      action === "revert-pending"
        ? staffService.revertItemToPreparing
        : staffService.revertItemToCooking;

    await Promise.all(itemIds.map((itemId) => actionFn(itemId)));
  };

  const handleStart = async (order) => {
    try {
      await markOrderItems(order, "cooking");
      showNotification(`${order.table} đã bắt đầu chế biến!`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể bắt đầu món",
      );
    }
  };

  const handleComplete = async (order) => {
    try {
      await markOrderItems(order, "cooked");
      showNotification(`${order.table} chế biến hoàn thành! Sẵn sàng phục vụ.`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể hoàn thành món",
      );
    }
  };

  const handleUndo = async (order, from) => {
    try {
      await undoOrderItems(
        order,
        from === "cooking" ? "revert-pending" : "revert-cooking",
      );

      showNotification(
        from === "cooking"
          ? `${order.table} đã hoàn tác, món quay về chờ nấu.`
          : `${order.table} đã hoàn tác, món quay về đang nấu.`,
      );
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Không thể hoàn tác món",
      );
    }
  };

  const handleDeliver = async (order) => {
    try {
      await markOrderItems(order, "serving");

      setBoard((prev) => ({
        ...prev,
        completedOrders: prev.completedOrders.filter(
          (item) => item.id !== order.id,
        ),
      }));

      const deliveredEntry = {
        id: `${order.id}-${Date.now()}`,
        table: order.table,
        quantity: getOrderQuantity(order),
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        date: new Date().toISOString().slice(0, 10),
      };

      saveDeliveryNotification(deliveredEntry);
      showNotification(`Đã bàn giao ${order.table} cho phục vụ.`);
      await fetchBoard();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Không thể ghi nhận bàn giao",
      );
    }
  };

  return (
    <div className="p-4">
      <div className="grid xl:grid-cols-4 gap-4">
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
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onDeliver={handleDeliver}
                  onUndo={handleUndo}
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
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onDeliver={handleDeliver}
                  onUndo={handleUndo}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 min-h-[524px] max-h-[524px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            <h2 className="font-bold text-green-600">ĐÃ XONG</h2>

            <span className="bg-green-100 text-green-600 px-2 rounded-full text-sm font-bold">
              {board.completedOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {board.completedOrders.length === 0 ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-xl">
                  🍳
                </div>
                <div>Trống</div>
              </div>
            ) : (
              board.completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  status="completed"
                  now={now}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onDeliver={handleDeliver}
                  onUndo={handleUndo}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 min-h-[520px] max-h-[520px] relative">
          {notification && (
            <div className="absolute -top-2 right-3 z-20 max-w-xs rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-md shadow-slate-200/70 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[12px] font-bold shrink-0">
                ✓
              </div>
              <p className="text-[12px] leading-4 font-semibold text-emerald-700">
                {notification}
              </p>
            </div>
          )}

          <h2 className="font-bold text-slate-800 mb-4">
            TỔNG HỢP MÓN (BATCHING)
          </h2>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {board.batching.length === 0 ? (
              <div className="flex items-center justify-center h-[420px]">
                <p className="text-slate-400 text-sm font-medium">
                  Hôm nay chưa có món nào
                </p>
              </div>
            ) : (
              board.batching.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-300">
                          No img
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">
                        {dish.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {dish.orderCount} đơn hôm nay
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-lg font-extrabold text-slate-800 leading-none">
                      {dish.qty}
                    </div>
                    <div className="text-xs text-slate-500">phần</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefDashboard;
