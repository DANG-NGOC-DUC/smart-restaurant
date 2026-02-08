import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const stats = [
  {
    label: "Doanh thu hom nay",
    value: "12.500.000",
    unit: "VND",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    color: "bg-sea-500",
  },
  {
    label: "Don hang",
    value: "48",
    unit: "don",
    change: "+8%",
    trend: "up",
    icon: ShoppingCart,
    color: "bg-coral-500",
  },
  {
    label: "Khach hang",
    value: "156",
    unit: "nguoi",
    change: "-3%",
    trend: "down",
    icon: Users,
    color: "bg-gold-500",
  },
  {
    label: "Mon da ban",
    value: "234",
    unit: "mon",
    change: "+15%",
    trend: "up",
    icon: UtensilsCrossed,
    color: "bg-crimson-500",
  },
];

const revenueData = [
  { name: "T2", value: 8500000 },
  { name: "T3", value: 9200000 },
  { name: "T4", value: 7800000 },
  { name: "T5", value: 11500000 },
  { name: "T6", value: 14200000 },
  { name: "T7", value: 18500000 },
  { name: "CN", value: 16800000 },
];

const topDishes = [
  { name: "Tom hum nuong", sold: 45, revenue: 13500000 },
  { name: "Cua hoang de", sold: 32, revenue: 9600000 },
  { name: "Ca mu hap", sold: 28, revenue: 5600000 },
  { name: "Muc xao sa ot", sold: 56, revenue: 4480000 },
  { name: "Ngheu hap thai", sold: 67, revenue: 3350000 },
];

const recentOrders = [
  {
    id: "DH001",
    table: "Ban 5",
    items: 4,
    total: 2850000,
    status: "Dang nau",
    time: "10 phut truoc",
  },
  {
    id: "DH002",
    table: "Ban 12",
    items: 6,
    total: 4200000,
    status: "Da phuc vu",
    time: "25 phut truoc",
  },
  {
    id: "DH003",
    table: "Ban 3",
    items: 2,
    total: 1500000,
    status: "Cho thanh toan",
    time: "35 phut truoc",
  },
  {
    id: "DH004",
    table: "Ban 8",
    items: 5,
    total: 3100000,
    status: "Dang nau",
    time: "40 phut truoc",
  },
];

const statusColors = {
  "Dang nau": "bg-gold-100 text-gold-700",
  "Da phuc vu": "bg-green-100 text-green-700",
  "Cho thanh toan": "bg-sea-100 text-sea-700",
};

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-sea-800">Dashboard</h1>
        <p className="text-sea-500">Tong quan hoat dong nha hang hom nay</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 shadow-card border border-sea-100"
          >
            <div className="flex items-start justify-between">
              <div
                className={`${stat.color} w-11 h-11 rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-600" : "text-crimson-600"}`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-sea-800">{stat.value}</p>
              <p className="text-sm text-sea-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sea-800">Doanh thu tuan nay</h2>
              <p className="text-sm text-sea-500">
                Bieu do doanh thu theo ngay
              </p>
            </div>
            <button className="text-sm text-sea-600 hover:text-sea-700 font-medium flex items-center gap-1">
              Xem chi tiet <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-72 min-h-[288px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A6B7C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1A6B7C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F4F6" />
                <XAxis dataKey="name" stroke="#6B7B7E" fontSize={12} />
                <YAxis
                  stroke="#6B7B7E"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${value.toLocaleString()} VND`,
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
          </div>
        </div>

        {/* Top dishes */}
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-sea-800">Mon ban chay</h2>
              <p className="text-sm text-sea-500">Top 5 mon ban chay nhat</p>
            </div>
          </div>
          <div className="space-y-4">
            {topDishes.map((dish, index) => (
              <div key={dish.name} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sea-100 rounded-lg flex items-center justify-center text-sm font-semibold text-sea-600">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sea-700 truncate">
                    {dish.name}
                  </p>
                  <p className="text-sm text-sea-500">{dish.sold} phan</p>
                </div>
                <p className="text-sm font-medium text-coral-600">
                  {(dish.revenue / 1000000).toFixed(1)}M
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-sea-800">Don hang gan day</h2>
            <p className="text-sm text-sea-500">Cac don hang moi nhat</p>
          </div>
          <button className="text-sm text-sea-600 hover:text-sea-700 font-medium flex items-center gap-1">
            Xem tat ca <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sea-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                  Ma don
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                  Ban
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                  So mon
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                  Tong tien
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                  Trang thai
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-600">
                  Thoi gian
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-sea-50 hover:bg-sea-50/50"
                >
                  <td className="py-3 px-4 font-medium text-sea-700">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-sea-600">{order.table}</td>
                  <td className="py-3 px-4 text-sea-600">{order.items} mon</td>
                  <td className="py-3 px-4 font-medium text-sea-700">
                    {order.total.toLocaleString()} d
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sea-500 text-sm">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
