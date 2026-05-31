import TopDishCard from "../../components/chef/TopDishCard";
import TableStatisticsCard from "../../components/chef/TableStatisticsCard";
import { useEffect, useState } from "react";

const DELIVERY_STORAGE_KEY = "chefLatestDelivered";

function ChefStatistics() {
  const topDishes = [
    {
      id: 1,
      name: "Hàu nướng mỡ hành",
      quantity: 125,
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae",
    },

    {
      id: 2,
      name: "Tôm nướng muối ớt",
      quantity: 86,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    },

    {
      id: 3,
      name: "Lẩu thái hải sản",
      quantity: 42,
      image: "https://images.unsplash.com/photo-1547592180-85f173990554",
    },

    {
      id: 4,
      name: "Sò điệp nướng phô mai",
      quantity: 35,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    },

    {
      id: 5,
      name: "Ốc hương xào bơ tỏi",
      quantity: 28,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    },
  ];

  const tableGroups = [
    [
      {
        id: 1,
        name: "BÀN 01",
        orders: ["2 Hàu nướng mỡ hành", "1 Ốc hương xào bơ tỏi"],
      },

      {
        id: 2,
        name: "BÀN 02",
        orders: ["2 Sò lông nướng mỡ hành"],
      },
    ],

    [
      {
        id: 5,
        name: "BÀN 05",
        orders: ["2 Hàu nướng phô mai", "1 Tôm sú nướng"],
      },

      {
        id: 6,
        name: "BÀN 06",
        orders: ["1 Mực nướng sa tế"],
      },
    ],

    [
      {
        id: 9,
        name: "BÀN 09",
        orders: ["1 Cá nướng giấy bạc", "1 Bia Tiger"],
      },

      {
        id: 10,
        name: "BÀN 10",
        orders: ["1 Sò điệp nướng phô mai"],
      },
    ],
  ];

  const [latestDelivered, setLatestDelivered] = useState(null);

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

            <span className="text-slate-800 font-bold">312 suất</span>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {tableGroups.map((group, index) => (
            <TableStatisticsCard key={index} tables={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChefStatistics;
