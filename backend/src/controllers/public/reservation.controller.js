import reservationService from "../../services/public/reservation.service.js";

export const createReservation = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { reserved_at, guest_count, note } = req.body;

    const reservation = await reservationService.createReservation({
      user_id,
      reserved_at,
      guest_count,
      note,
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const reservations = await reservationService.getMyReservations(user_id);
    res.json(reservations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;
    const reservation = await reservationService.cancelReservation(id, user_id);
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
