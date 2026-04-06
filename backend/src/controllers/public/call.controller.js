const callPublicService = require("../../services/public/call.service");

const requestPayment = async (req, res) => {
  try {
    const { table_id, note } = req.body;

    if (!table_id) {
      return res.status(400).json({ message: "Thiếu table_id" });
    }

    const request = await callPublicService.createPaymentRequest(
      table_id,
      note,
    );

    res.json({
      success: true,
      data: request,
      message: "Yêu cầu thanh toán đã gửi. Nhân viên sẽ đến hỗ trợ bạn!",
    });
  } catch (err) {
    console.error("Lỗi gửi yêu cầu thanh toán:", err);
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  requestPayment,
};
