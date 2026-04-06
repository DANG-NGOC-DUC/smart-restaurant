import { dashboardService } from "../../services/admin/dashboard.service.js";

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const getWeeklyRevenue = async (req, res, next) => {
  try {
    const data = await dashboardService.getWeeklyRevenue();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getTopDishes = async (req, res, next) => {
  try {
    const data = await dashboardService.getTopDishes();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentOrders();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const dashboardController = {
  getStats,
  getWeeklyRevenue,
  getTopDishes,
  getRecentOrders,
};
