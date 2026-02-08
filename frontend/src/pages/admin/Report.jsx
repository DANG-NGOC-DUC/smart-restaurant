"use client";

import { useState } from "react";
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const revenueData = [
  { date: "01/01", revenue: 15200000, orders: 42 },
  { date: "02/01", revenue: 18500000, orders: 51 },
  { date: "03/01", revenue: 12800000, orders: 35 },
  { date: "04/01", revenue: 21000000, orders: 58 },
  { date: "05/01", revenue: 19500000, orders: 54 },
  { date: "06/01", revenue: 24800000, orders: 68 },
  { date: "07/01", revenue: 22100000, orders: 61 },
];

const categoryData = [
  { name: "Hai san tuoi", value: 45, color: "#1A6B7C" },
  { name: "Mon nuong", value: 25, color: "#F28B6D" },
  { name: "Mon hap", value: 15, color: "#22C55E" },
  { name: "Lau", value: 10, color: "#CDA855" },
  { name: "Khac", value: 5, color: "#C23A4E" },
];

const topDishes = [
  { name: "Tom hum nuong bo toi", sold: 156, revenue: 101400000 },
  { name: "Cua hoang de hap bia", sold: 98, revenue: 83300000 },
  { name: "Lau hai san thap cam", sold: 87, revenue: 47850000 },
  { name: "Ca mu chien xu", sold: 134, revenue: 56280000 },
  { name: "Ngheu hap thai", sold: 245, revenue: 29400000 },
];

const timeRanges = ["Hom nay", "7 ngay", "30 ngay", "Thang nay", "Quy nay"];

function Reports() {
  const [selectedRange, setSelectedRange] = useState("7 ngay");

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Bao cao</h1>
          <p className="text-sea-500">
            Thong ke doanh thu va hoat dong kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-sea-200 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? "bg-sea-500 text-white"
                    : "text-sea-600 hover:bg-sea-100"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sea-200 rounded-lg text-sea-700 hover:bg-sea-50">
            <Download className="w-4 h-4" />
            Xuat bao cao
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <p className="text-sm text-sea-500 mb-1">Tong doanh thu</p>
          <p className="text-2xl font-bold text-sea-800">
            {(totalRevenue / 1000000).toFixed(1)}M
          </p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% so voi ky truoc</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <p className="text-sm text-sea-500 mb-1">Tong don hang</p>
          <p className="text-2xl font-bold text-sea-800">{totalOrders}</p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.3% so voi ky truoc</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <p className="text-sm text-sea-500 mb-1">Gia tri TB/don</p>
          <p className="text-2xl font-bold text-sea-800">
            {avgOrderValue.toLocaleString()}d
          </p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+3.8% so voi ky truoc</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <p className="text-sm text-sea-500 mb-1">Khach hang</p>
          <p className="text-2xl font-bold text-sea-800">1,234</p>
          <div className="flex items-center gap-1 mt-2 text-crimson-600 text-sm">
            <TrendingDown className="w-4 h-4" />
            <span>-2.1% so voi ky truoc</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <h2 className="font-semibold text-sea-800 mb-4">Bieu do doanh thu</h2>
          <div className="h-72 min-h-[288px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#B8D8DC" />
                <XAxis dataKey="date" stroke="#4A9AA8" fontSize={12} />
                <YAxis
                  stroke="#4A9AA8"
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
                    border: "1px solid #B8D8DC",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1A6B7C"
                  strokeWidth={2}
                  dot={{ fill: "#1A6B7C", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category pie chart */}
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <h2 className="font-semibold text-sea-800 mb-4">
            Doanh thu theo danh muc
          </h2>
          <div className="h-52 min-h-[208px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Ti le"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></span>
                  <span className="text-sea-600">{cat.name}</span>
                </div>
                <span className="font-medium text-sea-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top dishes table */}
      <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
        <h2 className="font-semibold text-sea-800 mb-4">
          Mon an ban chay nhat
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sea-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                  #
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                  Ten mon
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                  So luong ban
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                  Doanh thu
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                  Ti le
                </th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish, index) => {
                const percentage = Math.round(
                  (dish.revenue / totalRevenue) * 100,
                );
                return (
                  <tr
                    key={dish.name}
                    className="border-b border-sea-50 hover:bg-sea-50"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-gold-100 text-gold-700"
                            : index === 1
                              ? "bg-sea-200 text-sea-700"
                              : index === 2
                                ? "bg-coral-100 text-coral-700"
                                : "bg-sea-100 text-sea-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-sea-700">
                      {dish.name}
                    </td>
                    <td className="py-3 px-4 text-sea-600">{dish.sold} phan</td>
                    <td className="py-3 px-4 font-medium text-sea-700">
                      {(dish.revenue / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-sea-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sea-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-sea-500 w-10">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
