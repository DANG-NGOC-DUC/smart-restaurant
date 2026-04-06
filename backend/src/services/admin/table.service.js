import { TableModel } from "../../models/table.model.js";
import { SessionModel } from "../../models/session.model.js";
import { generateToken, generateQRCode } from "../../utils/qr.util.js";

/**
 * Gắn qr_data_uri (base64 ảnh QR) cho từng bàn
 */
const attachQRCodes = async (tables) => {
  return Promise.all(
    tables.map(async (table) => {
      const qr_data_uri = table.qr_token
        ? await generateQRCode(table.qr_token)
        : null;
      return { ...table, qr_data_uri };
    }),
  );
};

const getAllTables = async () => {
  const tables = await TableModel.findAll();
  return attachQRCodes(tables);
};

const getTableById = async (id) => {
  const table = await TableModel.findById(id);
  if (!table) return null;
  const qr_data_uri = table.qr_token
    ? await generateQRCode(table.qr_token)
    : null;
  return { ...table, qr_data_uri };
};

const createTable = async (data) => {
  const { name, code, capacity } = data;

  if (!name || !name.trim()) {
    throw new Error("Tên bàn là bắt buộc.");
  }

  if (!code) {
    throw new Error("Mã bàn là bắt buộc.");
  }

  if (capacity !== undefined && capacity !== null && capacity <= 0) {
    throw new Error("Sức chứa phải là số lớn hơn 0.");
  }

  // Kiểm tra trùng mã bàn
  const existing = await TableModel.findByCode(code.trim());
  if (existing) {
    throw new Error("Mã bàn này đã tồn tại.");
  }

  // Tự động sinh qr_token ngẫu nhiên 8 ký tự
  let qrToken = generateToken(8);
  // Đảm bảo unique
  while (await TableModel.findByQrToken(qrToken)) {
    qrToken = generateToken(8);
  }

  const table = await TableModel.create({
    name: name.trim(),
    code: code.trim(),
    qr_token: qrToken,
    capacity: capacity || 4,
    is_active: true,
  });

  // Trả kèm ảnh QR
  const qr_data_uri = await generateQRCode(qrToken);
  return { ...table, qr_data_uri };
};

const updateTable = async (id, data) => {
  const table = await TableModel.findById(id);
  if (!table) return null;

  // Nếu đổi mã bàn → kiểm tra trùng
  if (data.code && data.code.trim() !== table.code) {
    const existing = await TableModel.findByCode(data.code.trim());
    if (existing) {
      throw new Error("Mã bàn đã tồn tại.");
    }
    data.code = data.code.trim();
  }

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error("Tên bàn không được để trống.");
    }
    data.name = data.name.trim();
  }

  if (data.capacity !== undefined && data.capacity <= 0) {
    throw new Error("Sức chứa phải là số lớn hơn 0.");
  }

  // Không cho phép sửa qr_token từ client
  delete data.qr_token;

  const updated = await TableModel.update(id, {
    ...data,
    updated_at: new Date(),
  });
  const qr_data_uri = updated.qr_token
    ? await generateQRCode(updated.qr_token)
    : null;
  return { ...updated, qr_data_uri };
};

const deleteTable = async (id) => {
  const table = await TableModel.findById(id);
  if (!table) return null;

  // Không cho xóa bàn đang có session hoạt động
  const activeSession = await SessionModel.findActiveByTableId(id);
  if (activeSession) {
    throw new Error("Không thể xóa bàn đang có khách sử dụng.");
  }

  // Xóa các session cũ (đã đóng) liên quan đến bàn
  await SessionModel.deleteByTableId(id);

  const deleted = await TableModel.remove(id);
  return deleted > 0;
};

const getTablesWithStatus = async () => {
  const tables = await TableModel.findAllWithStatus();
  return attachQRCodes(tables);
};

const getTableStatus = async (id) => {
  const table = await TableModel.findById(id);
  if (!table) return null;

  const activeSession = await SessionModel.findActiveByTableId(id);
  const qr_data_uri = table.qr_token
    ? await generateQRCode(table.qr_token)
    : null;

  return {
    ...table,
    qr_data_uri,
    status: activeSession ? "occupied" : "available",
    session: activeSession || null,
  };
};

export const tableService = {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getTablesWithStatus,
  getTableStatus,
};
