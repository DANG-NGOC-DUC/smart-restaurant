import TopDishCard from "../../components/chef/TopDishCard";
import TableStatisticsCard from "../../components/chef/TableStatisticsCard";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  XCircle,
  ClipboardList,
  Timer,
} from "lucide-react";
import * as staffService from "../../services/staff.service";

const DELIVERY_STORAGE_KEY = "chefLatestDelivered";

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "served", label: "Đã phục vụ" },
  { key: "cancelled", label: "Đã hủy" },
];

const STATUS_BADGE = {
  served: {
    label: "Đã phục vụ",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ──────────────────────────────────────────
// Summary Card
// ──────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, unit, color }) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };
  const iconColorMap = {
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-4 ${colorMap[color] || colorMap.blue}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconColorMap[color]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
          {label}
        </p>
        <p className="text-2xl font-extrabold leading-tight">
          {value}
          {unit && (
            <span className="text-sm font-semibold ml-1 opacity-60">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────
function ChefStatistics() {
  // Board data (existing)
  const [topDishes, setTopDishes] = useState([]);
  const [allBatching, setAllBatching] = useState([]);
  const [totalServed, setTotalServed] = useState(0);
  const [tableGroups, setTableGroups] = useState([]);
  const [latestDelivered, setLatestDelivered] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);

  // Stats data (new)
  const [stats, setStats] = useState({
    totalServedToday: 0,
    totalCancelledToday: 0,
    totalOrdersToday: 0,
    avgCookingTimeMinutes: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // History data (new)
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [historyStatus, setHistoryStatus] = useState("");
  const [historyDate, setHistoryDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  // Batching search
  const [batchSearch, setBatchSearch] = useState("");

  // ── Fetch board data ──
  const fetchBoard = useCallback(async () => {
    try {
      setBoardLoading(true);
      const res = await staffService.getKitchenBoard();
      const board = res.data || {};

      const batching = Array.isArray(board.batching) ? board.batching : [];

      setTopDishes(
        batching.slice(0, 5).map((dish) => ({
          id: dish.id,
          name: dish.name,
          quantity: dish.qty ?? 0,
          image: dish.image || null,
        })),
      );

      setAllBatching(
        batching.map((dish) => ({
          id: dish.id,
          name: dish.name,
          image: dish.image || null,
          qty: Number(dish.qty || 0),
          orderCount: Number(dish.orderCount || 0),
        })),
      );

      setTotalServed(Number(board.totalServedToday || 0));

      const groups = Array.isArray(board.servingTableStats)
        ? board.servingTableStats.reduce((collection, table, index) => {
          const groupIndex = Math.floor(index / 2);
          if (!collection[groupIndex]) {
            collection[groupIndex] = [];
          }
          collection[groupIndex].push(table);
          return collection;
        }, [])
        : [];

      setTableGroups(groups.slice(0, 3));
    } catch (error) {
      console.error(error);
      setTopDishes([]);
      setAllBatching([]);
      setTableGroups([]);
      setTotalServed(0);
    } finally {
      setBoardLoading(false);
    }
  }, []);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await staffService.getKitchenStats();
      setStats(res.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch history ──
  const fetchHistory = useCallback(
    async (page = 1) => {
      try {
        setHistoryLoading(true);
        const res = await staffService.getKitchenHistory({
          page,
          limit: 20,
          status: historyStatus || undefined,
          date: historyDate,
        });
        const data = res.data || {};
        setHistoryItems(data.items || []);
        setHistoryPagination(
          data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
        );
      } catch (error) {
        console.error(error);
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyStatus, historyDate],
  );

  // ── Latest delivered (localStorage) ──
  const loadLatestDelivered = () => {
    try {
      const raw = window.localStorage.getItem(DELIVERY_STORAGE_KEY);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || typeof entry !== "object") return null;
      const today = new Date().toISOString().slice(0, 10);
      return entry.date === today ? entry : null;
    } catch {
      return null;
    }
  };

  // ── Initial load + listeners ──
  useEffect(() => {
    fetchBoard();
    fetchStats();
    fetchHistory(1);

    const entry = loadLatestDelivered();
    setLatestDelivered(entry);

    const onStorage = async (e) => {
      if (e?.key && e.key !== DELIVERY_STORAGE_KEY) return;
      setLatestDelivered(loadLatestDelivered());
      await fetchBoard();
      await fetchStats();
    };

    const onCustom = async (ev) => {
      const detail = ev?.detail;
      if (!detail) return;
      const today = new Date().toISOString().slice(0, 10);
      if (detail.date === today) {
        setLatestDelivered(detail);
      } else {
        setLatestDelivered(null);
      }
      await fetchBoard();
      await fetchStats();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("latestDeliveredUpdated", onCustom);

    const scheduleMidnightReset = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 2, 0);

      return window.setTimeout(() => {
        setLatestDelivered(null);
        fetchBoard();
        fetchStats();
        fetchHistory(1);
        scheduleMidnightReset();
      }, nextMidnight.getTime() - now.getTime());
    };

    const midnightTimer = scheduleMidnightReset();

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("latestDeliveredUpdated", onCustom);
      window.clearTimeout(midnightTimer);
    };
  }, [fetchBoard, fetchStats, fetchHistory]);

  // Re-fetch history when filters change
  useEffect(() => {
    fetchHistory(1);
  }, [historyStatus, historyDate, fetchHistory]);

  // ── Filtered batching ──
  const filteredBatching = useMemo(() => {
    const q = batchSearch.trim().toLowerCase();
    if (!q) return allBatching;
    return allBatching.filter((d) => d.name.toLowerCase().includes(q));
  }, [allBatching, batchSearch]);

  return (
    <div className="p-5 space-y-6 bg-slate-50 min-h-screen">
      {/* ① SUMMARY CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          icon={UtensilsCrossed}
          label="Tổng phục vụ"
          value={statsLoading ? "..." : stats.totalServedToday}
          unit="suất"
          color="emerald"
        />
        <SummaryCard
          icon={XCircle}
          label="Tổng hủy"
          value={statsLoading ? "..." : stats.totalCancelledToday}
          unit="suất"
          color="rose"
        />
        <SummaryCard
          icon={ClipboardList}
          label="Tổng đơn hàng"
          value={statsLoading ? "..." : stats.totalOrdersToday}
          unit="đơn"
          color="blue"
        />
        <SummaryCard
          icon={Timer}
          label="TG nấu trung bình"
          value={statsLoading ? "..." : stats.avgCookingTimeMinutes}
          unit="phút"
          color="amber"
        />
      </div>

      {/* ② TOP 5 MÓN BÁN CHẠY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold tracking-wide text-slate-800">
            🔥 TOP 5 MÓN BÁN CHẠY HÔM NAY
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tổng món đã phục vụ:</span>
            <span className="text-slate-800 font-bold">
              {boardLoading ? "Đang tải..." : `${totalServed} suất`}
            </span>
          </div>
        </div>

        {topDishes.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">
            Chưa có dữ liệu hôm nay
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-4">
            {topDishes.map((dish) => (
              <TopDishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>

      {/* ③ ĐƠN VỪA BÀN GIAO */}
      {latestDelivered ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-800 mb-4">
            🚀 ĐƠN BẾP VỪA BÀN GIAO THÀNH CÔNG
          </h2>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 font-bold text-[11px] border border-blue-100">
                  {latestDelivered.table}
                </span>

                <p className="text-slate-600 text-sm">
                  Hoàn thành{" "}
                  <span className="font-bold text-slate-900">
                    {latestDelivered.quantity} phần
                  </span>
                </p>
              </div>

              <span className="text-xs text-slate-400 font-semibold">
                🕒 {latestDelivered.time}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Chưa có đơn bàn giao hôm nay</p>
      )}

      {/* ④ TỔNG HỢP MÓN TRONG NGÀY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-bold text-slate-400">
            <span className="w-1.5 h-5 rounded-full bg-blue-500"></span>
            TỔNG HỢP MÓN TRONG NGÀY
          </h2>

          <div className="relative w-full max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm món..."
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {filteredBatching.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            {allBatching.length === 0
              ? "Hôm nay chưa có món nào"
              : "Không tìm thấy món phù hợp"}
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredBatching.map((dish) => (
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
            ))}
          </div>
        )}
      </div>

      {/* ⑤ CHI TIẾT PHỤC VỤ THEO BÀN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <h2 className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-bold text-slate-400 mb-4">
          <span className="w-1.5 h-5 rounded-full bg-emerald-500"></span>
          CHI TIẾT PHỤC VỤ GỌI MÓN THEO TỪNG BÀN
        </h2>

        {tableGroups.length === 0 ? (
          <p className="text-sm text-slate-400">
            Hôm nay chưa có đơn gần đây để thống kê theo bàn.
          </p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {tableGroups.map((group, index) => (
              <TableStatisticsCard key={index} tables={group} />
            ))}
          </div>
        )}
      </div>

      {/* ⑥ LỊCH SỬ MÓN TOÀN BỘ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <h2 className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-bold text-slate-400 mb-4">
          <span className="w-1.5 h-5 rounded-full bg-violet-500"></span>
          LỊCH SỬ MÓN TOÀN BỘ
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Status tabs */}
          <div className="flex items-center gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${historyStatus === tab.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                onClick={() => setHistoryStatus(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date picker */}
          <input
            type="date"
            value={historyDate}
            onChange={(e) => setHistoryDate(e.target.value)}
            className="h-8 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-slate-100"
          />
        </div>

        {/* Table */}
        {historyLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-200 border-t-slate-600"></div>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-xl">
              🍳
            </div>
            <p className="text-sm font-medium">
              Không có dữ liệu cho{" "}
              {historyDate === new Date().toISOString().slice(0, 10)
                ? "hôm nay"
                : formatDate(historyDate)}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Món
                    </th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      SL
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Bàn
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Ghi chú
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Giờ đặt
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Hoàn thành
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyItems.map((item) => {
                    const badge = STATUS_BADGE[item.status] || {
                      label: item.status,
                      className: "bg-slate-50 text-slate-600 border-slate-200",
                    };
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[8px] text-slate-300">
                                  N/A
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">
                                {item.menu_item_name}
                              </p>
                              {item.variant_label && (
                                <p className="text-[10px] text-slate-400">
                                  {item.variant_label}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-100">
                            {item.table_name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs max-w-[160px] truncate">
                          {item.note || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                          {formatTime(item.created_at)}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                          {item.status === "served"
                            ? formatTime(item.served_at)
                            : item.status === "cancelled"
                              ? formatTime(item.cancelled_at)
                              : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <div>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            {item.status === "cancelled" &&
                              item.cancel_reason && (
                                <p className="mt-0.5 text-[10px] text-rose-500 italic truncate max-w-[140px]">
                                  {item.cancel_reason}
                                </p>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {historyItems.map((item) => {
                const badge = STATUS_BADGE[item.status] || {
                  label: item.status,
                  className: "bg-slate-50 text-slate-600 border-slate-200",
                };
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[8px] text-slate-300">
                              N/A
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {item.menu_item_name}
                          </p>
                          {item.variant_label && (
                            <p className="text-[10px] text-slate-400">
                              {item.variant_label}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        SL: <b className="text-slate-800">{item.quantity}</b>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                        {item.table_name}
                      </span>
                      <span>🕒 {formatTime(item.created_at)}</span>
                      {item.status === "served" && item.served_at && (
                        <span>✅ {formatTime(item.served_at)}</span>
                      )}
                    </div>
                    {item.note && (
                      <p className="mt-1.5 text-xs text-slate-500 italic">
                        📝 {item.note}
                      </p>
                    )}
                    {item.status === "cancelled" && item.cancel_reason && (
                      <p className="mt-1 text-[10px] text-rose-500 italic">
                        Lý do: {item.cancel_reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {historyPagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Hiển thị{" "}
                  <b>
                    {(historyPagination.page - 1) * historyPagination.limit + 1}
                  </b>{" "}
                  –{" "}
                  <b>
                    {Math.min(
                      historyPagination.page * historyPagination.limit,
                      historyPagination.total,
                    )}
                  </b>{" "}
                  / <b>{historyPagination.total}</b> món
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={historyPagination.page <= 1}
                    onClick={() => fetchHistory(historyPagination.page - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-semibold text-slate-700 px-2">
                    {historyPagination.page} / {historyPagination.totalPages}
                  </span>
                  <button
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={
                      historyPagination.page >= historyPagination.totalPages
                    }
                    onClick={() => fetchHistory(historyPagination.page + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ChefStatistics;
