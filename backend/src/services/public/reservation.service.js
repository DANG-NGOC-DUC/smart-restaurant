import { ReservationModel } from "../../models/reservation.model.js";
import knex from "../../db/knex.js";

/**
 * Tạo đặt bàn mới
 */
const createReservation = async ({
  user_id,
  reserved_at,
  guest_count,
  note,
}) => {
  if (!user_id) throw new Error("Bạn cần đăng nhập để đặt bàn.");
  if (!reserved_at) throw new Error("Vui lòng chọn ngày và giờ.");

  // Kiểm tra thời gian hợp lệ (phải trong tương lai)
  const reservedDate = new Date(reserved_at);
  if (reservedDate <= new Date()) {
    throw new Error("Thời gian đặt bàn phải trong tương lai.");
  }

  // Kiểm tra khách đã có đặt bàn pending chưa
  const existing = await knex("reservations")
    .where({ user_id, status: "pending" })
    .first();
  if (existing) {
    throw new Error("Bạn đã có lịch đặt bàn đang chờ xác nhận.");
  }

  const reservation = await ReservationModel.create({
    user_id,
    reserved_at,
    guest_count: guest_count || 2,
    note: note || null,
    status: "pending",
  });

  return reservation;
};

/**
 * Lấy danh sách đặt bàn của user
 */
const getMyReservations = async (user_id) => {
  return knex("reservations").where({ user_id }).orderBy("reserved_at", "desc");
};

/**
 * Hủy đặt bàn
 */
const cancelReservation = async (id, user_id) => {
  const reservation = await knex("reservations").where({ id }).first();
  if (!reservation) throw new Error("Không tìm thấy đặt bàn.");
  if (reservation.user_id !== user_id) throw new Error("Không có quyền.");
  if (reservation.status !== "pending") {
    throw new Error("Chỉ có thể hủy đặt bàn đang chờ xác nhận.");
  }

  return ReservationModel.update(id, { status: "cancelled" });
};

export default { createReservation, getMyReservations, cancelReservation };
