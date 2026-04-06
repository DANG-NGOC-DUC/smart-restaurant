import { tableService } from "../../services/admin/table.service.js";

const getAllTables = async (req, res, next) => {
  try {
    const tables = await tableService.getAllTables();
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
};

const getTableById = async (req, res, next) => {
  try {
    const table = await tableService.getTableById(req.params.id);
    if (!table) {
      return res.status(404).json({ error: "Bàn không tồn tại." });
    }
    res.status(200).json(table);
  } catch (error) {
    next(error);
  }
};

const createTable = async (req, res, next) => {
  try {
    const table = await tableService.createTable(req.body);
    res.status(201).json(table);
  } catch (error) {
    if (
      error.message.includes("bắt buộc") ||
      error.message.includes("đã tồn tại") ||
      error.message.includes("lớn hơn 0")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body);
    if (!table) {
      return res.status(404).json({ error: "Bàn không tồn tại." });
    }
    res.status(200).json(table);
  } catch (error) {
    if (
      error.message.includes("đã tồn tại") ||
      error.message.includes("lớn hơn 0")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const result = await tableService.deleteTable(req.params.id);
    if (result === null) {
      return res.status(404).json({ error: "Bàn không tồn tại." });
    }
    res.status(200).json({ message: "Đã xóa bàn." });
  } catch (error) {
    if (error.message.includes("đang có khách")) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

const getTablesWithStatus = async (req, res, next) => {
  try {
    const tables = await tableService.getTablesWithStatus();
    res.status(200).json(tables);
  } catch (error) {
    next(error);
  }
};

const getTableStatus = async (req, res, next) => {
  try {
    const result = await tableService.getTableStatus(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Bàn không tồn tại." });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const tableController = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getTablesWithStatus,
  getTableStatus,
};
