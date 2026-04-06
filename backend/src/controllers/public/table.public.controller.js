import { tablePublicService } from "../../services/public/table.public.service.js";

const scanTable = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await tablePublicService.scanTable(token);
    res.status(200).json(result);
  } catch (error) {
    if (
      error.message.includes("không hợp lệ") ||
      error.message.includes("không hoạt động")
    ) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const tablePublicController = {
  scanTable,
};
