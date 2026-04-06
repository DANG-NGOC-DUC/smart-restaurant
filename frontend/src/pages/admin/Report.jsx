"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
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
import {
  getReportSummary,
  getRevenueChart,
  getTopItems,
  getCategoryRevenue,
  getPaymentMethods,
  getPeakHours,
} from "../../services/admin.service";

const timeRanges = [
  { key: "today", label: "Hôm nay" },
  { key: "7days", label: "7 ngày" },
  { key: "30days", label: "30 ngày" },
  { key: "this_month", label: "Tháng này" },
  { key: "this_quarter", label: "Quý này" },
];

const formatCurrency = (value) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString("vi-VN");
};

function StatCard({ label, value, change, format = "number" }) {
  const isPositive = change >= 0;
  const displayValue =
    format === "currency"
      ? formatCurrency(value)
      : value.toLocaleString("vi-VN");

  return (
    <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
      <p className="text-sm text-sea-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-sea-800">
        {displayValue}
        {format === "currency" && (
          <span className="text-base font-normal">₫</span>
        )}
      </p>
      <div
        className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? "text-green-600" : "text-crimson-600"}`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>
          {isPositive ? "+" : ""}
          {change}% so với kỳ trước
        </span>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-sea-500" />
      <span className="ml-3 text-sea-500">Đang tải dữ liệu...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-sea-500">
      <AlertCircle className="w-10 h-10 mb-3 text-crimson-500" />
      <p className="mb-3">{message || "Không thể tải dữ liệu"}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-full text-sea-400 text-sm">
      {message || "Chưa có dữ liệu"}
    </div>
  );
}

function Reports() {
  const [selectedRange, setSelectedRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        summaryRes,
        revenueRes,
        topItemsRes,
        categoryRes,
        paymentRes,
        peakRes,
      ] = await Promise.all([
        getReportSummary(selectedRange),
        getRevenueChart(selectedRange),
        getTopItems(selectedRange, 10),
        getCategoryRevenue(selectedRange),
        getPaymentMethods(selectedRange),
        getPeakHours(selectedRange),
      ]);

      setSummary(summaryRes.data);
      setRevenueData(revenueRes.data);
      setTopItems(topItemsRes.data);
      setCategoryData(categoryRes.data);
      setPaymentData(paymentRes.data);
      setPeakHoursData(peakRes.data);
    } catch (err) {
      console.error("Report fetch error:", err);
      setError(err.response?.data?.error || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalTopRevenue = topItems.reduce((sum, d) => sum + d.totalRevenue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Báo cáo</h1>
          <p className="text-sea-500">
            Thống kê doanh thu và hoạt động kinh doanh
          </p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Báo cáo</h1>
          <p className="text-sea-500">
            Thống kê doanh thu và hoạt động kinh doanh
          </p>
        </div>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sea-800">Báo cáo</h1>
          <p className="text-sea-500">
            Thống kê doanh thu và hoạt động kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-sea-200 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.key}
                onClick={() => setSelectedRange(range.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedRange === range.key
                    ? "bg-sea-500 text-white"
                    : "text-sea-600 hover:bg-sea-100"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng doanh thu"
            value={summary.totalRevenue}
            change={summary.revenueChange}
            format="currency"
          />
          <StatCard
            label="Tổng đơn hàng"
            value={summary.totalOrders}
            change={summary.ordersChange}
          />
          <StatCard
            label="Giá trị TB/đơn"
            value={summary.avgOrderValue}
            change={summary.avgOrderChange}
            format="currency"
          />
          <StatCard
            label="Lượt khách"
            value={summary.totalCustomers}
            change={summary.customersChange}
          />
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-sea-100 pb-0">
        {[
          { key: "overview", label: "Tổng quan", icon: TrendingUp },
          { key: "peak", label: "Giờ cao điểm", icon: Clock },
          { key: "payment", label: "Thanh toán", icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-sea-500 text-sea-700"
                : "border-transparent text-sea-400 hover:text-sea-600"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card border border-sea-100">
              <h2 className="font-semibold text-sea-800 mb-4">
                Biểu đồ doanh thu
              </h2>
              <div className="h-72 min-h-[288px]">
                {revenueData.length > 0 ? (
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
                        tickFormatter={(v) => formatCurrency(v)}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${value.toLocaleString("vi-VN")}₫`,
                          "Doanh thu",
                        ]}
                        labelFormatter={(label) => `Ngày ${label}`}
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
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Chưa có dữ liệu doanh thu" />
                )}
              </div>
            </div>

            {/* Category pie chart */}
            <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
              <h2 className="font-semibold text-sea-800 mb-4">
                Doanh thu theo danh mục
              </h2>
              <div className="h-52 min-h-[208px]">
                {categoryData.length > 0 ? (
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
                        dataKey="percentage"
                        nameKey="name"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value}%`, name]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #B8D8DC",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Chưa có dữ liệu danh mục" />
                )}
              </div>
              <div className="space-y-2 mt-4">
                {categoryData.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span className="text-sea-600">{cat.name}</span>
                    </div>
                    <span className="font-medium text-sea-800">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top dishes table */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
            <h2 className="font-semibold text-sea-800 mb-4">
              Món ăn bán chạy nhất
            </h2>
            {topItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sea-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                        Tên món
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                        Số lượng bán
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                        Doanh thu
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-sea-500">
                        Tỉ lệ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((dish, index) => {
                      const percentage =
                        totalTopRevenue > 0
                          ? Math.round(
                              (dish.totalRevenue / totalTopRevenue) * 100,
                            )
                          : 0;
                      return (
                        <tr
                          key={dish.id}
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
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {dish.imageUrl && (
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              )}
                              <span className="font-medium text-sea-700">
                                {dish.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sea-600">
                            {dish.totalSold} phần
                          </td>
                          <td className="py-3 px-4 font-medium text-sea-700">
                            {formatCurrency(dish.totalRevenue)}₫
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
            ) : (
              <div className="text-center py-10 text-sea-400">
                Chưa có dữ liệu bán hàng
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Peak Hours */}
      {activeTab === "peak" && (
        <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
          <h2 className="font-semibold text-sea-800 mb-4">
            Phân bố đơn hàng theo giờ
          </h2>
          <div className="h-80 min-h-[320px]">
            {peakHoursData.some((d) => d.orderCount > 0) ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <BarChart
                  data={peakHoursData.filter(
                    (d) => d.hourNum >= 6 && d.hourNum <= 23,
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#B8D8DC" />
                  <XAxis dataKey="hour" stroke="#4A9AA8" fontSize={11} />
                  <YAxis stroke="#4A9AA8" fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "orderCount"
                        ? `${value} đơn`
                        : `${value.toLocaleString("vi-VN")}₫`,
                      name === "orderCount" ? "Số đơn" : "Doanh thu",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #B8D8DC",
                    }}
                  />
                  <Bar
                    dataKey="orderCount"
                    fill="#1A6B7C"
                    radius={[4, 4, 0, 0]}
                    name="orderCount"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Chưa có dữ liệu giờ cao điểm" />
            )}
          </div>
          {/* Peak summary */}
          {peakHoursData.some((d) => d.orderCount > 0) && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const peak = peakHoursData.reduce(
                  (max, d) => (d.orderCount > max.orderCount ? d : max),
                  peakHoursData[0],
                );
                const totalOrders = peakHoursData.reduce(
                  (sum, d) => sum + d.orderCount,
                  0,
                );
                const activeHours = peakHoursData.filter(
                  (d) => d.orderCount > 0,
                ).length;
                const avgOrders =
                  activeHours > 0 ? Math.round(totalOrders / activeHours) : 0;
                return (
                  <>
                    <div className="bg-sea-50 rounded-lg p-4">
                      <p className="text-sm text-sea-500">Giờ cao điểm nhất</p>
                      <p className="text-xl font-bold text-sea-800">
                        {peak.hour}
                      </p>
                      <p className="text-sm text-sea-500">
                        {peak.orderCount} đơn
                      </p>
                    </div>
                    <div className="bg-sea-50 rounded-lg p-4">
                      <p className="text-sm text-sea-500">Tổng đơn trong kỳ</p>
                      <p className="text-xl font-bold text-sea-800">
                        {totalOrders}
                      </p>
                    </div>
                    <div className="bg-sea-50 rounded-lg p-4">
                      <p className="text-sm text-sea-500">
                        TB đơn/giờ hoạt động
                      </p>
                      <p className="text-xl font-bold text-sea-800">
                        {avgOrders}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tab: Payment Methods */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
            <h2 className="font-semibold text-sea-800 mb-4">
              Tỷ lệ phương thức thanh toán
            </h2>
            <div className="h-64 min-h-[256px]">
              {paymentData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="percentage"
                      nameKey="label"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #B8D8DC",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Chưa có dữ liệu thanh toán" />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-sea-100">
            <h2 className="font-semibold text-sea-800 mb-4">
              Chi tiết thanh toán
            </h2>
            {paymentData.length > 0 ? (
              <div className="space-y-4">
                {paymentData.map((pm) => (
                  <div
                    key={pm.method}
                    className="flex items-center gap-4 p-3 bg-sea-50 rounded-lg"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pm.color }}
                    ></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sea-700">{pm.label}</p>
                        <p className="font-bold text-sea-800">
                          {pm.percentage}%
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-sm text-sea-500">
                        <span>{pm.count} giao dịch</span>
                        <span>{formatCurrency(pm.total)}₫</span>
                      </div>
                      <div className="mt-2 h-2 bg-sea-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pm.percentage}%`,
                            backgroundColor: pm.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sea-400">
                Chưa có dữ liệu thanh toán
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
