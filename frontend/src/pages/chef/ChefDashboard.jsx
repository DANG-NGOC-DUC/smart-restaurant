import { useEffect, useState } from "react";
import {
  Users,
  Clock,
  Play,
  Check,
  RotateCcw,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useSupabaseRealtime } from "../../hooks/shared/useSupabaseRealtime";
import * as staffService from "../../services/staff.service";

const DELIVERY_STORAGE_KEY = "chefLatestDelivered";
const DELIVERED_IDS_KEY = "chefDeliveredOrderIds";
const KITCHEN_SUBSCRIPTIONS = [{ table: "order_items", event: "*" }];

function getDeliveredOrderIds() {
  try {
    const raw = window.localStorage.getItem(DELIVERED_IDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDeliveredOrderIds(orderIds) {
  window.localStorage.setItem(DELIVERED_IDS_KEY, JSON.stringify(orderIds));
}

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
  const deliveredIds = getDeliveredOrderIds();
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
    ? board.completedOrders
        .map(normalizeOrder)
        .filter((order) => !deliveredIds.includes(order.id))
        .sort(sortByCreatedAt)
    : [];

  return { pendingOrders, cookingOrders, completedOrders };
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

  const handleDeliver = (order) => {
    (async () => {
      try {
        await markOrderItems(order, "serving");

        // Keep localStorage dispatch for immediate local notification (same-tab)
        try {
          const quantity = getOrderQuantity(order);
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, "0");
          const mm = String(now.getMinutes()).padStart(2, "0");
          const time = `${hh}:${mm}`;
          const date = now.toISOString().slice(0, 10);

          const entry = {
            orderId: order.id,
            table: order.table,
            quantity,
            time,
            date,
            items: order.items.map((item) => ({
              qty: item.qty,
              name: item.name,
            })),
          };

          window.localStorage.setItem(
            DELIVERY_STORAGE_KEY,
            JSON.stringify(entry),
          );
          const deliveredOrderIds = getDeliveredOrderIds();
          if (!deliveredOrderIds.includes(order.id)) {
            deliveredOrderIds.push(order.id);
            saveDeliveredOrderIds(deliveredOrderIds);
          }

          window.dispatchEvent(
            new CustomEvent("latestDeliveredUpdated", { detail: entry }),
          );
        } catch {
          // ignore local notification failures
        }

        setBoard((prev) => ({
          ...prev,
          completedOrders: prev.completedOrders.filter(
            (item) => item.id !== order.id,
          ),
        }));
        showNotification(`Đã bàn giao ${order.table} cho phục vụ.`);
        await fetchBoard();
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Không thể ghi nhận bàn giao",
        );
      }
    })();
  };

  const batching = [
    {
      name: "Hàu nướng mỡ hành",
      qty: 12,
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae",
    },
    {
      name: "Tôm nướng muối ớt",
      qty: 8,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    },
    {
      name: "Sò điệp nướng phô mai",
      qty: 6,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    },
    {
      name: "Ốc hương xào bơ tỏi",
      qty: 5,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    },
    {
      name: "Lẩu thái hải sản",
      qty: 3,
      image: "https://images.unsplash.com/photo-1547592180-85f173990554",
    },
    {
      name: "Mực nướng sa tế",
      qty: 1,
      image: "https://images.unsplash.com/photo-1523978591478-c753949ff840",
    },
    {
      name: "Cá nướng giấy bạc",
      qty: 2,
      image: "https://images.unsplash.com/photo-1514516681008-5f1f4d6f6f28",
    },
  ];

  return (
    <div className="p-4">
      {(loading || error) && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}
        >
          {error || "Đang tải dữ liệu bếp..."}
        </div>
      )}

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

          <div className="space-y-4">
            {batching.map((dish, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{dish.name}</span>
                </div>

                <span className="font-bold text-slate-800">
                  {dish.qty} phần
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefDashboard;
