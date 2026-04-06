import { TableModel } from "../../models/table.model.js";
import { SessionModel } from "../../models/session.model.js";

// Khách scan QR → lấy thông tin bàn + tự tạo phiên nếu chưa có
const scanTable = async (token) => {
  const table = await TableModel.findByQrToken(token);
  if (!table) {
    throw new Error("Mã QR không hợp lệ.");
  }

  if (!table.is_active) {
    throw new Error("Bàn hiện không hoạt động.");
  }

  // Lấy phiên đang mở, nếu chưa có thì tự tạo
  let activeSession = await SessionModel.findActiveByTableId(table.id);

  if (!activeSession) {
    activeSession = await SessionModel.create({
      table_id: table.id,
      user_id: null, // khách tự tạo, không có staff
      status: "open",
    });
  }

  return {
    table: {
      id: table.id,
      name: table.name,
      code: table.code,
      capacity: table.capacity,
    },
    session: {
      id: activeSession.id,
      started_at: activeSession.started_at,
    },
    has_active_session: true,
  };
};

export const tablePublicService = {
  scanTable,
};
