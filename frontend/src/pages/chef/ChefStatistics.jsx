import TopDishCard from "../../components/chef/TopDishCard";
import TableStatisticsCard from "../../components/chef/TableStatisticsCard";
import { useEffect, useState } from "react";
import * as adminService from "../../services/admin.service";

const DELIVERY_STORAGE_KEY = "chefLatestDelivered";

function ChefStatistics() {
  const [topDishes, setTopDishes] = useState([]);
  const [tableGroups, setTableGroups] = useState([]);
  const [latestDelivered, setLatestDelivered] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      const [topDishesRes, recentOrdersRes] = await Promise.all([
        adminService.getDashboardTopDishes(),
        adminService.getDashboardRecentOrders(),
      ]);

      setTopDishes(
        Array.isArray(topDishesRes.data)
          ? topDishesRes.data.map((dish) => ({
              id: dish.id,
              name: dish.name,
              quantity: dish.sold ?? dish.quantity ?? 0,
              image: dish.image || null,
            }))
          : [],
      );

      const groupedOrders = Array.isArray(recentOrdersRes.data)
        ? recentOrdersRes.data.reduce((groups, order, index) => {
            const groupIndex = Math.floor(index / 2);
            if (!groups[groupIndex]) {
              groups[groupIndex] = [];
            }

            groups[groupIndex].push({
              id: order.id,
              name: order.tableName || "N/A",
              orders: [
                {
                  quantity: order.itemCount || 0,
                  name:
                    order.status === "completed"
                      ? "đơn hoàn thành"
                      : order.status === "pending"
                        ? "đơn chờ duyệt"
                        : "đơn đang xử lý",
                },
              ],
            });
            return groups;
          }, [])
        : [];

      setTableGroups(groupedOrders.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

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

    const onStorage = (e) => {
      if (e?.key && e.key !== DELIVERY_STORAGE_KEY) return;
      load();
    };

    const onCustom = (ev) => {
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
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("latestDeliveredUpdated", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("latestDeliveredUpdated", onCustom);
    };
  }, []);

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* Top món */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-wide text-slate-800">
            🔥 TOP 5 MÓN BÁN CHẠY HÔM NAY
          </h2>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Tổng món đã phục vụ:</span>

            <span className="text-slate-800 font-bold">
              {topDishes.reduce(
                (sum, dish) => sum + Number(dish.quantity || 0),
                0,
              )}{" "}
              suất
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mt-6">
          {topDishes.map((dish) => (
            <TopDishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>

      {/* Đơn bếp vừa bàn giao thành công */}
      {latestDelivered ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6">
            🚀 ĐƠN BẾP VỪA BÀN GIAO THÀNH CÔNG
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs border border-blue-100">
                  {latestDelivered.table}
                </span>

                <p className="text-slate-600">
                  Hoàn thành{" "}
                  <span className="font-bold text-slate-900">
                    {latestDelivered.quantity} phần món ăn
                  </span>
                </p>
              </div>

              <span className="text-sm text-slate-400 font-semibold">
                🕒 {latestDelivered.time}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Chưa có đơn bàn giao hôm nay</p>
      )}

      {/* Chi tiết theo bàn */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-bold text-slate-400 mb-6">
          <span className="w-1.5 h-5 rounded-full bg-emerald-500"></span>
          CHI TIẾT PHỤC VỤ GỌI MÓN THEO TỪNG BÀN
        </h2>

        {tableGroups.length === 0 ? (
          <p className="text-sm text-slate-400">
            Hôm nay chưa có đơn gần đây để thống kê theo bàn.
          </p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
