const homePublicService = require("../../services/public/home.service");

const getHomeInfo = async (req, res) => {
  try {
    const { tableId } = req.params;

    if (!tableId) {
      return res.status(400).json({ message: "Thiếu tableId" });
    }

    const info = await homePublicService.getHomeInfo(tableId);

    res.json(info);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getHomeInfo,
};
