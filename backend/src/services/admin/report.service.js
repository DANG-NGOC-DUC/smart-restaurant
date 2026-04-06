import knex from "../../db/knex.js";

/**
 * Tính khoảng thời gian dựa trên range string
 */
const getDateRange = (range) => {
  const now = new Date();
  let from, to;
  to = new Date(now);
  to.setHours(23, 59, 59, 999);

  switch (range) {
    case "today":
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      break;
    case "7days":
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case "30days":
      from = new Date(now);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      break;
    case "this_month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "this_quarter": {
      const quarter = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    }
    default:
      // default 7 days
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
  }

  return { from, to };
};

/**
 * Tính khoảng thời gian kỳ trước (cùng độ dài) để so sánh
 */
const getPreviousRange = (from, to) => {
  const diff = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diff);
  return { from: prevFrom, to: prevTo };
};

/**
 * Tính % thay đổi
 */
const calcChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

/**
 * Summary: 4 KPI cards
 * - Total revenue, total orders, avg order value, total customers (sessions)
 * - So sánh với kỳ trước
 */
const getSummary = async (range) => {
  const { from, to } = getDateRange(range);
  const prev = getPreviousRange(from, to);

  // Current period
  const currentStats = await knex("orders")
    .where("orders.status", "completed")
    .whereBetween("orders.created_at", [from, to])
    .select(
      knex.raw("COALESCE(SUM(total_price), 0) as total_revenue"),
      knex.raw("COUNT(*) as total_orders"),
    )
    .first();

  const currentSessions = await knex("sessions")
    .whereBetween("started_at", [from, to])
    .count("id as count")
    .first();

  // Previous period
  const prevStats = await knex("orders")
    .where("orders.status", "completed")
    .whereBetween("orders.created_at", [prev.from, prev.to])
    .select(
      knex.raw("COALESCE(SUM(total_price), 0) as total_revenue"),
      knex.raw("COUNT(*) as total_orders"),
    )
    .first();

  const prevSessions = await knex("sessions")
    .whereBetween("started_at", [prev.from, prev.to])
    .count("id as count")
    .first();

  const totalRevenue = parseFloat(currentStats.total_revenue) || 0;
  const totalOrders = parseInt(currentStats.total_orders) || 0;
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalCustomers = parseInt(currentSessions.count) || 0;

  const prevRevenue = parseFloat(prevStats.total_revenue) || 0;
  const prevOrders = parseInt(prevStats.total_orders) || 0;
  const prevAvg = prevOrders > 0 ? Math.round(prevRevenue / prevOrders) : 0;
  const prevCustomers = parseInt(prevSessions.count) || 0;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    totalCustomers,
    revenueChange: calcChange(totalRevenue, prevRevenue),
    ordersChange: calcChange(totalOrders, prevOrders),
    avgOrderChange: calcChange(avgOrderValue, prevAvg),
    customersChange: calcChange(totalCustomers, prevCustomers),
  };
};

/**
 * Revenue chart data: doanh thu theo ngày trong khoảng thời gian
 */
const getRevenueChart = async (range) => {
  const { from, to } = getDateRange(range);

  const rows = await knex("orders")
    .where("orders.status", "completed")
    .whereBetween("orders.created_at", [from, to])
    .select(
      knex.raw("DATE(orders.created_at) as date"),
      knex.raw("COALESCE(SUM(total_price), 0) as revenue"),
      knex.raw("COUNT(*) as orders"),
    )
    .groupByRaw("DATE(orders.created_at)")
    .orderByRaw("DATE(orders.created_at)");

  // Fill missing dates
  const result = [];
  const current = new Date(from);
  const end = new Date(to);
  const dataMap = {};

  rows.forEach((r) => {
    const key = new Date(r.date).toISOString().split("T")[0];
    dataMap[key] = {
      revenue: parseFloat(r.revenue) || 0,
      orders: parseInt(r.orders) || 0,
    };
  });

  while (current <= end) {
    const key = current.toISOString().split("T")[0];
    const day = current.getDate().toString().padStart(2, "0");
    const month = (current.getMonth() + 1).toString().padStart(2, "0");
    result.push({
      date: `${day}/${month}`,
      fullDate: key,
      revenue: dataMap[key]?.revenue || 0,
      orders: dataMap[key]?.orders || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
};

/**
 * Top items: món bán chạy nhất
 */
const getTopItems = async (range, limit = 10) => {
  const { from, to } = getDateRange(range);

  const rows = await knex("order_items")
    .join("orders", "orders.id", "order_items.order_id")
    .join("menu_items", "menu_items.id", "order_items.menu_item_id")
    .where("orders.status", "completed")
    .whereNot("order_items.status", "cancelled")
    .whereBetween("orders.created_at", [from, to])
    .select(
      "menu_items.id",
      "menu_items.name",
      "menu_items.image_url",
      knex.raw("SUM(order_items.quantity) as total_sold"),
      knex.raw(
        "SUM(order_items.price * order_items.quantity) as total_revenue",
      ),
    )
    .groupBy("menu_items.id", "menu_items.name", "menu_items.image_url")
    .orderBy("total_revenue", "desc")
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    imageUrl: r.image_url,
    totalSold: parseInt(r.total_sold) || 0,
    totalRevenue: parseFloat(r.total_revenue) || 0,
  }));
};

/**
 * Category revenue: doanh thu theo danh mục
 */
const getCategoryRevenue = async (range) => {
  const { from, to } = getDateRange(range);

  const COLORS = [
    "#1A6B7C",
    "#F28B6D",
    "#22C55E",
    "#CDA855",
    "#C23A4E",
    "#6366F1",
    "#EC4899",
  ];

  const rows = await knex("order_items")
    .join("orders", "orders.id", "order_items.order_id")
    .join("menu_items", "menu_items.id", "order_items.menu_item_id")
    .join("menu_categories", "menu_categories.id", "menu_items.category_id")
    .where("orders.status", "completed")
    .whereNot("order_items.status", "cancelled")
    .whereBetween("orders.created_at", [from, to])
    .select(
      "menu_categories.id",
      "menu_categories.name",
      knex.raw("SUM(order_items.price * order_items.quantity) as revenue"),
    )
    .groupBy("menu_categories.id", "menu_categories.name")
    .orderBy("revenue", "desc");

  const totalRevenue = rows.reduce(
    (sum, r) => sum + (parseFloat(r.revenue) || 0),
    0,
  );

  return rows.map((r, i) => ({
    id: r.id,
    name: r.name,
    revenue: parseFloat(r.revenue) || 0,
    percentage:
      totalRevenue > 0
        ? Math.round(((parseFloat(r.revenue) || 0) / totalRevenue) * 100)
        : 0,
    color: COLORS[i % COLORS.length],
  }));
};

/**
 * Payment methods: tỷ lệ phương thức thanh toán
 */
const getPaymentMethods = async (range) => {
  const { from, to } = getDateRange(range);

  const rows = await knex("invoices")
    .whereBetween("created_at", [from, to])
    .select(
      "payment_method",
      knex.raw("COUNT(*) as count"),
      knex.raw("COALESCE(SUM(total_amount), 0) as total"),
    )
    .groupBy("payment_method")
    .orderBy("total", "desc");

  const totalAmount = rows.reduce(
    (sum, r) => sum + (parseFloat(r.total) || 0),
    0,
  );

  const LABELS = {
    cash: "Tiền mặt",
    transfer: "Chuyển khoản",
    momo: "MoMo",
    bank: "Thẻ ngân hàng",
  };

  const COLORS = {
    cash: "#22C55E",
    transfer: "#1A6B7C",
    momo: "#D63384",
    bank: "#CDA855",
  };

  return rows.map((r) => ({
    method: r.payment_method,
    label: LABELS[r.payment_method] || r.payment_method,
    count: parseInt(r.count) || 0,
    total: parseFloat(r.total) || 0,
    percentage:
      totalAmount > 0
        ? Math.round(((parseFloat(r.total) || 0) / totalAmount) * 100)
        : 0,
    color: COLORS[r.payment_method] || "#6B7280",
  }));
};

/**
 * Peak hours: giờ cao điểm
 */
const getPeakHours = async (range) => {
  const { from, to } = getDateRange(range);

  const rows = await knex("orders")
    .where("orders.status", "completed")
    .whereBetween("orders.created_at", [from, to])
    .select(
      knex.raw("EXTRACT(HOUR FROM orders.created_at) as hour"),
      knex.raw("COUNT(*) as order_count"),
      knex.raw("COALESCE(SUM(total_price), 0) as revenue"),
    )
    .groupByRaw("EXTRACT(HOUR FROM orders.created_at)")
    .orderByRaw("EXTRACT(HOUR FROM orders.created_at)");

  // Fill all hours 0-23
  const dataMap = {};
  rows.forEach((r) => {
    dataMap[parseInt(r.hour)] = {
      orderCount: parseInt(r.order_count) || 0,
      revenue: parseFloat(r.revenue) || 0,
    };
  });

  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    hourNum: i,
    orderCount: dataMap[i]?.orderCount || 0,
    revenue: dataMap[i]?.revenue || 0,
  }));
};

export const reportService = {
  getSummary,
  getRevenueChart,
  getTopItems,
  getCategoryRevenue,
  getPaymentMethods,
  getPeakHours,
};
