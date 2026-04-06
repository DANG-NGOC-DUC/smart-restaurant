import { reportService } from "../../services/admin/report.service.js";

const getSummary = async (req, res, next) => {
  try {
    const { range = "7days" } = req.query;
    const summary = await reportService.getSummary(range);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

const getRevenueChart = async (req, res, next) => {
  try {
    const { range = "7days" } = req.query;
    const data = await reportService.getRevenueChart(range);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getTopItems = async (req, res, next) => {
  try {
    const { range = "7days", limit = 10 } = req.query;
    const data = await reportService.getTopItems(range, parseInt(limit));
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getCategoryRevenue = async (req, res, next) => {
  try {
    const { range = "7days" } = req.query;
    const data = await reportService.getCategoryRevenue(range);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getPaymentMethods = async (req, res, next) => {
  try {
    const { range = "7days" } = req.query;
    const data = await reportService.getPaymentMethods(range);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getPeakHours = async (req, res, next) => {
  try {
    const { range = "7days" } = req.query;
    const data = await reportService.getPeakHours(range);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const reportController = {
  getSummary,
  getRevenueChart,
  getTopItems,
  getCategoryRevenue,
  getPaymentMethods,
  getPeakHours,
};
