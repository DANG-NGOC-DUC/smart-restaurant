import TopDishCard from "../../components/chef/TopDishCard";
import TableStatisticsCard from "../../components/chef/TableStatisticsCard";
import { useCallback, useEffect, useState } from "react";
import * as staffService from "../../services/staff.service";

const DELIVERY_STORAGE_KEY = "chefLatestDelivered";

function ChefStatistics() {
  const [topDishes, setTopDishes] = useState([]);
  const [totalServed, setTotalServed] = useState(0);
  const [tableGroups, setTableGroups] = useState([]);
  const [latestDelivered, setLatestDelivered] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);

      const res = await staffService.getKitchenBoard();
      const board = res.data || {};

      setTopDishes(
        Array.isArray(board.batching)
          ? board.batching.slice(0, 5).map((dish) => ({
              id: dish.id,
              name: dish.name,
              quantity: dish.qty ?? 0,
              image: dish.image || null,
            }))
          : [],
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
      setTableGroups([]);
      setTotalServed(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLatestDelivered = () => {
    try {
      const raw = window.localStorage.getItem(DELIVERY_STORAGE_KEY);
      if (!raw) return null;

      const entry = JSON.parse(raw);
      if (!entry || typeof entry !== "object") return null;

      const today = new Date().toISOString().slice(0, 10);
      return entry.date === today ? entry : null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    fetchStatistics();

    const load = () => {
      const entry = loadLatestDelivered();
      if (!entry) return setLatestDelivered(null);

      setLatestDelivered(entry);
    };

    load();

    const onStorage = async (e) => {
      if (e?.key && e.key !== DELIVERY_STORAGE_KEY) return;
      load();
      await fetchStatistics();
    };

    const onCustom = async (ev) => {
      const entry = ev?.detail;
      if (!entry) return;
      const today = new Date().toISOString().slice(0, 10);
      if (entry.date === today) {
        window.localStorage.setItem(
          "chefLatestDelivered",
          JSON.stringify(entry),
        );
        setLatestDelivered(entry);
      } else {
        window.localStorage.removeItem("chefLatestDelivered");
        setLatestDelivered(null);
      }
      await fetchStatistics();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("latestDeliveredUpdated", onCustom);

    const scheduleMidnightReset = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 2, 0);

      return window.setTimeout(() => {
        setCurrentDate(new Date().toISOString().slice(0, 10));
        setLatestDelivered(null);
        fetchStatistics();
        scheduleMidnightReset();
      }, nextMidnight.getTime() - now.getTime());
    };

    const midnightTimer = scheduleMidnightReset();

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("latestDeliveredUpdated", onCustom);
      window.clearTimeout(midnightTimer);
    };
  }, [fetchStatistics]);

  return (
    <div className="p-5 space-y-6 bg-slate-50 min-h-screen">
      {/* Top món */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold tracking-wide text-slate-800">
            🔥 TOP 5 MÓN BÁN CHẠY HÔM NAY
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Tổng món đã phục vụ:</span>

            <span className="text-slate-800 font-bold">
              {loading ? "Đang tải..." : `${totalServed} suất`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-4">
          {topDishes.map((dish) => (
            <TopDishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>

      {/* Đơn bếp vừa bàn giao thành công */}
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

      {/* Chi tiết theo bàn */}
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
    </div>
  );
}

export default ChefStatistics;
