import { sessionService } from "../../services/admin/session.service.js";

const openSession = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const user_id = req.body?.user_id || null;
    const session = await sessionService.openSession(tableId, user_id);
    res.status(201).json(session);
  } catch (error) {
    if (
      error.message.includes("không tồn tại") ||
      error.message.includes("không hoạt động") ||
      error.message.includes("đang có khách")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const closeSession = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const force = req.body?.force === true;
    const session = await sessionService.closeSession(tableId, { force });
    res.status(200).json({ message: "Đã đóng phiên.", session });
  } catch (error) {
    if (error.message === "UNSERVED_ITEMS") {
      return res.status(409).json({
        error: "Còn món chưa phục vụ.",
        unservedCount: error.unservedCount,
        unservedItems: error.unservedItems,
      });
    }
    if (error.message.includes("không có phiên")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const getActiveSession = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const session = await sessionService.getActiveSession(tableId);
    if (!session) {
      return res
        .status(200)
        .json({ message: "Bàn đang trống.", session: null });
    }
    res.status(200).json(session);
  } catch (error) {
    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const sessionController = {
  openSession,
  closeSession,
  getActiveSession,
};
