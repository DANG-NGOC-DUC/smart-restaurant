import knex from "../../db/knex.js";
import crypto from "crypto";

export const callPublicService = {
  /**
   * Gửi yêu cầu dịch vụ từ thực khách (gọi phục vụ, tính tiền, v.v.)
   */
  async createServiceRequest({
    table_id,
    session_id = null,
    request_type = "call_waiter",
    note = null,
  }) {
    if (!table_id) throw new Error("Thiếu table_id.");

    const validTypes = ["call_waiter", "request_bill", "need_help"];
    if (!validTypes.includes(request_type))
      throw new Error(
        `Loại yêu cầu không hợp lệ. Cho phép: ${validTypes.join(", ")}`,
      );

    const [request] = await knex("service_requests")
      .insert({
        id: crypto.randomUUID(),
        table_id,
        session_id,
        request_type,
        status: "pending",
        note,
      })
      .returning("*");

    return request;
  },
};
