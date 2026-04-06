import knex from "../db/knex.js";
import crypto from "crypto";

const TABLE = "tables";

export const TableModel = {
  async create(data) {
    const [created] = await knex(TABLE)
      .insert({ id: crypto.randomUUID(), ...data })
      .returning("*");
    return created;
  },

  async findAll() {
    return knex(TABLE).select("*").orderBy("name", "asc");
  },

  async findById(id) {
    return knex(TABLE).where({ id }).first();
  },

  async update(id, data) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  },

  async remove(id) {
    return knex(TABLE).where({ id }).del();
  },

  async findByCode(code) {
    return knex(TABLE).where({ code }).first();
  },

  async findByQrToken(qrToken) {
    return knex(TABLE).where({ qr_token: qrToken }).first();
  },

  async findAllActive() {
    return knex(TABLE).where({ is_active: true }).orderBy("name", "asc");
  },

  // Lấy tất cả bàn kèm trạng thái (trống / đang dùng)
  async findAllWithStatus() {
    return knex(TABLE)
      .leftJoin("sessions", function () {
        this.on("sessions.table_id", "=", `${TABLE}.id`).andOnNull(
          "sessions.ended_at",
        );
      })
      .select(
        `${TABLE}.*`,
        knex.raw(
          "CASE WHEN COUNT(sessions.id) > 0 THEN 'occupied' ELSE 'available' END AS status",
        ),
        knex.raw("MAX(sessions.id::text) as session_id"),
        knex.raw("MAX(sessions.user_id::text) as session_user_id"),
        knex.raw("MAX(sessions.started_at) as session_started_at"),
      )
      .groupBy(`${TABLE}.id`)
      .orderBy(`${TABLE}.name`, "asc");
  },
};
