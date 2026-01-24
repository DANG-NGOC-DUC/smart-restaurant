import knex from "../db/knex.js";

const TABLE = "reservations";

export const ReservationModel = {
  async create(reservation) {
    const [created] = await knex(TABLE).insert(reservation).returning("*");
    return created;
  },

  async findByUser(user_id) {
    return knex(TABLE).where({ user_id });
  },

  async findByTable(table_id) {
    return knex(TABLE).where({ table_id });
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
};
