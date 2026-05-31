import { Users, Clock, Play, Check, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

function ChefDashboard() {
  const getDeliveredOrderIds = () => {
    try {
      const raw = window.localStorage.getItem("chefDeliveredOrderIds");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveDeliveredOrderIds = (orderIds) => {
    window.localStorage.setItem(
      "chefDeliveredOrderIds",
      JSON.stringify(orderIds),
    );
  };

  const initialPendingOrders = [
    {
      id: 1,
      table: "BÀN 05",
      timer: "03:22",
      guests: 2,
      createdAt: "22:39",
      note: "KHÔNG HÀNH",
      items: [
        { qty: 2, name: "Hàu nướng mỡ hành" },
        { qty: 1, name: "Sò điệp nướng phô mai" },
      ],
    },
    {
      id: 2,
      table: "BÀN 12",
      timer: "02:52",
      guests: 2,
      createdAt: "22:45",
      items: [{ qty: 2, name: "Ốc hương xào bơ tỏi" }],
    },
  ];

  const initialCookingOrders = [
    {
      id: 3,
      table: "BÀN 02",
      timer: "08:49",
      guests: 2,
      createdAt: "22:32",
      note: "ÍT CAY",
      items: [
        { qty: 2, name: "Hàu nướng phô mai" },
        { qty: 1, name: "Tôm sú nướng" },
      ],
    },
    {
      id: 4,
      table: "BÀN 07",
      timer: "07:22",
      guests: 3,
      createdAt: "22:40",
      items: [
        { qty: 1, name: "Cá hồi nướng" },
        { qty: 1, name: "Mực nướng sa tế" },
      ],
    },
  ];

  const initialCompletedOrders = [
    {
      id: 5,
      table: "BÀN 01",
      timer: "11:19",
      guests: 2,
      createdAt: "22:44",
      note: "SẴN SÀNG",
      items: [
        { qty: 2, name: "Hàu nướng mỡ hành" },
        { qty: 1, name: "Ốc hương xào bơ tỏi" },
      ],
    },
  ];

  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);

  const [cookingOrders, setCookingOrders] = useState(initialCookingOrders);

  const [completedOrders, setCompletedOrders] = useState(() =>
    initialCompletedOrders.filter(
      (order) => !getDeliveredOrderIds().includes(order.id),
    ),
  );

  const [now, setNow] = useState(() => Date.now());
  const [notification, setNotification] = useState(null);

  const formatElapsed = (seconds) => {
    const totalSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  const getCookingSeconds = (order) => {
    if (typeof order.elapsedSeconds === "number") {
      if (order.startedAt) {
        const startedAtMs = new Date(order.startedAt).getTime();
        return Math.max(
          order.elapsedSeconds,
          Math.floor((now - startedAtMs) / 1000),
        );
      }

      return order.elapsedSeconds;
    }

    if (order.startedAt) {
      const startedAtMs = new Date(order.startedAt).getTime();
      return Math.max(0, Math.floor((now - startedAtMs) / 1000));
    }

    return 0;
  };

  const getDisplayTimer = (order, status) => {
    if (status === "cooking") {
      return formatElapsed(getCookingSeconds(order));
    }

    if (status === "completed" && typeof order.elapsedSeconds === "number") {
      return formatElapsed(order.elapsedSeconds);
    }

    return order.timer;
  };

  const showNotification = (message) => {
    setNotification(message);
  };

  const handleStart = (order) => {
    const startedAt = new Date().toISOString();
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
    setCookingOrders((prev) => [
      { ...order, timer: "00:00", startedAt, elapsedSeconds: 0 },
      ...prev,
    ]);

    showNotification(`${order.table} đã bắt đầu chế biến!`);
  };

  const handleComplete = (order) => {
    const elapsedSeconds = getCookingSeconds(order);
    setCookingOrders((prev) => prev.filter((o) => o.id !== order.id));
    setCompletedOrders((prev) => [
      {
        ...order,
        timer: formatElapsed(elapsedSeconds),
        elapsedSeconds,
        completedAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    showNotification(`${order.table} chế biến hoàn thành! Sẵn sàng phục vụ.`);
  };

  const handleUndo = (order, from) => {
    if (from === "cooking") {
      // move back to pending
      setCookingOrders((prev) => prev.filter((o) => o.id !== order.id));
      setPendingOrders((prev) => [
        { ...order, startedAt: undefined, elapsedSeconds: undefined },
        ...prev,
      ]);
    }

    if (from === "completed") {
      // move back to cooking
      setCompletedOrders((prev) => prev.filter((o) => o.id !== order.id));
      setCookingOrders((prev) => [
        {
          ...order,
          startedAt: new Date(
            Date.now() - (order.elapsedSeconds || 0) * 1000,
          ).toISOString(),
        },
        ...prev,
      ]);
    }
  };

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

  const handleDeliver = (order) => {
    try {
      const quantity = order.items.reduce((s, it) => s + (it.qty || 0), 0);
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const time = `${hh}:${mm}`;
      const date = now.toISOString().slice(0, 10); // YYYY-MM-DD

      const entry = {
        table: order.table,
        quantity,
        time,
        date,
        items: order.items.map((it) => ({ qty: it.qty, name: it.name })),
      };

      window.localStorage.setItem("chefLatestDelivered", JSON.stringify(entry));
      const deliveredOrderIds = getDeliveredOrderIds();
      if (!deliveredOrderIds.includes(order.id)) {
        deliveredOrderIds.push(order.id);
        saveDeliveredOrderIds(deliveredOrderIds);
      }
      // dispatch custom event so same-tab listeners update immediately
      try {
        window.dispatchEvent(
          new CustomEvent("latestDeliveredUpdated", { detail: entry }),
        );
      } catch {
        // ignore
      }

      showNotification(`Serving: Đã giao món thành công cho ${order.table}!`);

      setCompletedOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error("handleDeliver error", err);
    }
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

  const OrderCard = ({ order, status }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 h-[205px] flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-extrabold text-[17px] text-slate-800 tracking-tight">
          {order.table}
        </h3>

        <span
          className={`text-[13px] font-bold ${status === "pending" ? "text-blue-600" : status === "cooking" ? "text-orange-500" : "text-green-600"}`}
        >
          {getDisplayTimer(order, status)}
        </span>
      </div>

      <div className="text-sm text-slate-700 mb-1.5">
        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-0.5">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
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
              <span>{order.guests}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>{order.createdAt}</span>
            </div>
          </div>

          <div className="opacity-70" />
        </div>

        {status === "pending" && (
          <div>
            <button
              className="w-full h-9 rounded-xl border border-blue-200 bg-white/80 text-blue-600 font-medium flex items-center justify-center gap-2 text-[13px] shadow-sm transition-all duration-150 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
              onClick={() => handleStart(order)}
            >
              <Play size={14} />
              Bắt đầu
            </button>
          </div>
        )}

        {status === "cooking" && (
          <div className="flex items-center gap-2.5">
            <button
              className="flex-1 h-9 rounded-xl border border-orange-200 bg-white/80 text-orange-500 text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-orange-50 hover:border-orange-300 hover:shadow-md"
              onClick={() => handleUndo(order, "cooking")}
            >
              <RotateCcw size={13} className="inline mr-1.5" />
              Hoàn tác
            </button>

            <button
              className="flex-1 h-9 rounded-xl bg-green-600 text-white text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-green-500 hover:shadow-md"
              onClick={() => handleComplete(order)}
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
              onClick={() => handleUndo(order, "completed")}
            >
              <RotateCcw size={13} className="inline mr-1.5" />
              Hoàn tác
            </button>

            <button
              className="flex-1 h-9 rounded-xl bg-green-600 text-white text-[13px] flex items-center justify-center min-w-0 shadow-sm transition-all duration-150 hover:bg-green-500 hover:shadow-md"
              onClick={() => handleDeliver(order)}
            >
              Giao
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="grid xl:grid-cols-4 gap-4">
        {/* Chờ nấu */}
        <div className="bg-slate-100 rounded-2xl p-4 min-h-[524px] max-h-[524px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            <h2 className="font-bold text-blue-600">CHỜ NẤU</h2>

            <span className="bg-blue-100 text-blue-600 px-2 rounded-full text-sm font-bold">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {pendingOrders.length === 0 ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-xl">
                  🍳
                </div>
                <div>Trống</div>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="pending" />
              ))
            )}
          </div>
        </div>

        {/* Đang nấu */}
        <div className="bg-amber-50 rounded-2xl p-4 min-h-[524px] max-h-[524px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            <h2 className="font-bold text-orange-500">ĐANG NẤU</h2>

            <span className="bg-orange-100 text-orange-500 px-2 rounded-full text-sm font-bold">
              {cookingOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {cookingOrders.length === 0 ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-xl">
                  🍳
                </div>
                <div>Trống</div>
              </div>
            ) : (
              cookingOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="cooking" />
              ))
            )}
          </div>
        </div>

        {/* Đã xong */}
        <div className="bg-green-50 rounded-2xl p-4 min-h-[524px] max-h-[524px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            <h2 className="font-bold text-green-600">ĐÃ XONG</h2>

            <span className="bg-green-100 text-green-600 px-2 rounded-full text-sm font-bold">
              {completedOrders.length}
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {completedOrders.length === 0 ? (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 text-xl">
                  🍳
                </div>
                <div>Trống</div>
              </div>
            ) : (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="completed" />
              ))
            )}
          </div>
        </div>

        {/* Batching */}
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
