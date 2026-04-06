const db = require("../../db/knex");

exports.homePublicService = {
  getHomeInfo: async (tableId) => {
    const table = await db("tables").where("id", tableId).first();

    if (!table) {
      throw new Error("Bàn không tồn tại");
    }

    return {
      table: {
        id: table.id,
        name: table.name || `B${tableId}`,
        status: table.status || "occupied",
      },
      greeting: "Chào buổi chiều Quý khách",
      message: `Chúng tôi sẽ phục vụ tại bàn: B${tableId}`,
    };
  },
};
