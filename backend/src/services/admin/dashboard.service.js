import knex from "../../db/knex.js";

/**
 * Lấy khoảng thời gian hôm nay (00:00 → 23:59)
 */
const getTodayRange = () => {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

/**
 * Lấy khoảng thời gian hôm qua
 */
const getYesterdayRange = () => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 1);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setDate(to.getDate() - 1);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

const calcChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

/**
 * 4 stat cards: doanh thu, đơn hàng, khách hàng (sessions), món đã bán
 * So sánh với hôm qua
 */
const getStats = async () => {
  const today = getTodayRange();
  const yesterday = getYesterdayRange();

  // --- Today ---
  const todayOrders = await knex("orders")
    .where("status", "completed")
    .whereBetween("created_at", [today.from, today.to])
    .select(
      knex.raw("COALESCE(SUM(total_price), 0) as revenue"),
      knex.raw("COUNT(*) as order_count"),
    )
    .first();

  const todaySessions = await knex("sessions")
    .whereBetween("started_at", [today.from, today.to])
    .count("id as count")
    .first();

  const todayItemsSold = await knex("order_items")
    .join("orders", "orders.id", "order_items.order_id")
    .where("orders.status", "completed")
    .whereNot("order_items.status", "cancelled")
    .whereBetween("orders.created_at", [today.from, today.to])
    .select(knex.raw("COALESCE(SUM(order_items.quantity), 0) as total"))
    .first();

  // --- Yesterday ---
  const yesterdayOrders = await knex("orders")
    .where("status", "completed")
    .whereBetween("created_at", [yesterday.from, yesterday.to])
    .select(
      knex.raw("COALESCE(SUM(total_price), 0) as revenue"),
      knex.raw("COUNT(*) as order_count"),
    )
    .first();

  const yesterdaySessions = await knex("sessions")
    .whereBetween("started_at", [yesterday.from, yesterday.to])
    .count("id as count")
    .first();

  const yesterdayItemsSold = await knex("order_items")
    .join("orders", "orders.id", "order_items.order_id")
    .where("orders.status", "completed")
    .whereNot("order_items.status", "cancelled")
    .whereBetween("orders.created_at", [yesterday.from, yesterday.to])
    .select(knex.raw("COALESCE(SUM(order_items.quantity), 0) as total"))
    .first();

  const revenue = parseFloat(todayOrders.revenue) || 0;
  const orders = parseInt(todayOrders.order_count) || 0;
  const customers = parseInt(todaySessions.count) || 0;
  const itemsSold = parseInt(todayItemsSold.total) || 0;

  const prevRevenue = parseFloat(yesterdayOrders.revenue) || 0;
  const prevOrders = parseInt(yesterdayOrders.order_count) || 0;
  const prevCustomers = parseInt(yesterdaySessions.count) || 0;
  const prevItemsSold = parseInt(yesterdayItemsSold.total) || 0;

  return {
    revenue,
    orders,
    customers,
    itemsSold,
    revenueChange: calcChange(revenue, prevRevenue),
    ordersChange: calcChange(orders, prevOrders),
    customersChange: calcChange(customers, prevCustomers),
    itemsSoldChange: calcChange(itemsSold, prevItemsSold),
  };
};

/**
 * Doanh thu 7 ngày gần nhất (bao gồm hôm nay) cho AreaChart
 */
const getWeeklyRevenue = async () => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);

  const rows = await knex("orders")
    .where("status", "completed")
    .whereBetween("created_at", [from, to])
    .select(
      knex.raw("DATE(created_at) as date"),
      knex.raw("COALESCE(SUM(total_price), 0) as revenue"),
    )
    .groupByRaw("DATE(created_at)")
    .orderByRaw("DATE(created_at)");

  const dataMap = {};
  rows.forEach((r) => {
    const key = new Date(r.date).toISOString().split("T")[0];
    dataMap[key] = parseFloat(r.revenue) || 0;
  });

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const result = [];
  const current = new Date(from);

  while (current <= to) {
    const key = current.toISOString().split("T")[0];
    const dayOfWeek = current.getDay();
    result.push({
      name: dayNames[dayOfWeek],
      date: key,
      value: dataMap[key] || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
};

/**
 * Top 5 món bán chạy nhất hôm nay
 */
const getTopDishes = async () => {
  const { from, to } = getTodayRange();

  const rows = await knex("order_items")
    .join("orders", "orders.id", "order_items.order_id")
    .join("menu_items", "menu_items.id", "order_items.menu_item_id")
    .where("orders.status", "completed")
    .whereNot("order_items.status", "cancelled")
    .whereBetween("orders.created_at", [from, to])
    .select(
      "menu_items.id",
      "menu_items.name",
      knex.raw("SUM(order_items.quantity) as sold"),
      knex.raw("SUM(order_items.price * order_items.quantity) as revenue"),
    )
    .groupBy("menu_items.id", "menu_items.name")
    .orderBy("sold", "desc")
    .limit(5);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sold: parseInt(r.sold) || 0,
    revenue: parseFloat(r.revenue) || 0,
  }));
};

/**
 * Đơn hàng gần đây (10 đơn mới nhất)
 */
const getRecentOrders = async () => {
  const orders = await knex("orders")
    .leftJoin("sessions", "sessions.id", "orders.session_id")
    .leftJoin("tables", "tables.id", "sessions.table_id")
    .select(
      "orders.id",
      "orders.total_price",
      "orders.status",
      "orders.created_at",
      "tables.name as table_name",
    )
    .orderBy("orders.created_at", "desc")
    .limit(10);

  if (orders.length === 0) return [];

  // Đếm số món (không tính cancelled) cho mỗi order
  const orderIds = orders.map((o) => o.id);
  const itemCounts = await knex("order_items")
    .whereIn("order_id", orderIds)
    .whereNot("status", "cancelled")
    .select("order_id", knex.raw("SUM(quantity) as item_count"))
    .groupBy("order_id");

  const countMap = {};
  itemCounts.forEach(
    (c) => (countMap[c.order_id] = parseInt(c.item_count) || 0),
  );

  return orders.map((o) => ({
    id: o.id,
    tableName: o.table_name || "N/A",
    itemCount: countMap[o.id] || 0,
    totalPrice: parseFloat(o.total_price) || 0,
    status: o.status,
    createdAt: o.created_at,
  }));
};

export const dashboardService = {
  getStats,
  getWeeklyRevenue,
  getTopDishes,
  getRecentOrders,
};
