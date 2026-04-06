import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getDashboardWeeklyRevenue,
  getDashboardTopDishes,
  getDashboardRecentOrders,
} from "../../services/admin.service";

const formatCurrency = (value) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString("vi-VN");
};

const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
};

const statusConfig = {
  pending: { label: "Chờ xác nhận", color: "bg-sea-100 text-sea-700" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Đang nấu", color: "bg-gold-100 text-gold-700" },
  served: { label: "Đã phục vụ", color: "bg-green-100 text-green-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-crimson-100 text-crimson-700" },
};

const statMeta = [
  {
    key: "revenue",
    changeKey: "revenueChange",
    label: "Doanh thu hôm nay",
    unit: "VND",
    icon: DollarSign,
    color: "bg-sea-500",
    format: "currency",
  },
  {
    key: "orders",
    changeKey: "ordersChange",
    label: "Đơn hàng",
    unit: "đơn",
    icon: ShoppingCart,
    color: "bg-coral-500",
  },
  {
    key: "customers",
    changeKey: "customersChange",
    label: "Khách hàng",
    unit: "người",
    icon: Users,
    color: "bg-gold-500",
  },
  {
    key: "itemsSold",
    changeKey: "itemsSoldChange",
    label: "Món đã bán",
    unit: "món",
    icon: UtensilsCrossed,
    color: "bg-crimson-500",
  },
];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, revenueRes, dishesRes, ordersRes] = await Promise.all([
        getDashboardStats(),
        getDashboardWeeklyRevenue(),
        getDashboardTopDishes(),
        getDashboardRecentOrders(),
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setTopDishes(dishesRes.data);
      setRecentOrders(ordersRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.error || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh mỗi 60 giây
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Dashboard</h1>
          <p className="text-sea-500">Tổng quan hoạt động nhà hàng hôm nay</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-sea-500" />
          <span className="ml-3 text-sea-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Dashboard</h1>
          <p className="text-sea-500">Tổng quan hoạt động nhà hàng hôm nay</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-sea-500">
          <AlertCircle className="w-10 h-10 mb-3 text-crimson-500" />
          <p className="mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-sea-800">Dashboard</h1>
        <p className="text-sea-500">Tổng quan hoạt động nhà hàng hôm nay</p>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statMeta.map((s) => {
            const value = stats[s.key] ?? 0;
            const change = stats[s.changeKey] ?? 0;
            const isUp = change >= 0;
            return (
              <div
                key={s.key}
                className="bg-white rounded-xl p-5 shadow-card border border-sea-100"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`${s.color} w-11 h-11 rounded-lg flex items-center justify-center`}
                  >
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${isUp ? "text-green-600" : "text-crimson-600"}`}
                  >
                    {isUp ? "+" : ""}
                    {change}%
                    {isUp ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-sea-800">
                    {s.format === "currency"
                      ? formatCurrency(value)
                      : value.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-sea-500">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sea-800">Doanh thu tuần này</h2>
              <p className="text-sm text-sea-500">
                Biểu đồ doanh thu 7 ngày gần nhất
              </p>
            </div>
          </div>
          <div className="h-72 min-h-[288px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1A6B7C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1A6B7C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8F4F6" />
                  <XAxis dataKey="name" stroke="#6B7B7E" fontSize={12} />
                  <YAxis
                    stroke="#6B7B7E"
                    fontSize={12}
                    tickFormatter={(v) => formatCurrency(v)}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${value.toLocaleString("vi-VN")}₫`,
                      "Doanh thu",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E8F4F6",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1A6B7C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sea-400 text-sm">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Top dishes */}
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sea-800">Món bán chạy</h2>
              <p className="text-sm text-sea-500">Top 5 món bán chạy hôm nay</p>
            </div>
          </div>
          <div className="space-y-4">
            {topDishes.length > 0 ? (
              topDishes.map((dish, index) => (
                <div key={dish.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sea-100 rounded-lg flex items-center justify-center text-sm font-semibold text-sea-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sea-700 truncate">
                      {dish.name}
                    </p>
                    <p className="text-sm text-sea-500">{dish.sold} phần</p>
                  </div>
                  <p className="text-sm font-medium text-coral-600">
                    {formatCurrency(dish.revenue)}₫
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sea-400 text-sm">
                Chưa có dữ liệu hôm nay
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-sea-800">Đơn hàng gần đây</h2>
            <p className="text-sm text-sea-500">Các đơn hàng mới nhất</p>
          </div>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sea-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                    Mã đơn
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                    Bàn
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                    Số món
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                    Tổng tiền
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const sc = statusConfig[order.status] || {
                    label: order.status,
                    color: "bg-sea-100 text-sea-700",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-sea-50 hover:bg-sea-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-sea-700">
                        {order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-sea-600">
                        {order.tableName}
                      </td>
                      <td className="py-3 px-4 text-sea-600">
                        {order.itemCount} món
                      </td>
                      <td className="py-3 px-4 font-medium text-sea-700">
                        {formatCurrency(order.totalPrice)}₫
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sea-500 text-sm">
                        {formatTimeAgo(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-sea-400 text-sm">
            Chưa có đơn hàng nào
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
