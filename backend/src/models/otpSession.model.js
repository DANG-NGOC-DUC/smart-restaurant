import knex from "../db/knex.js";

const TABLE = "otp_sessions";

export const OtpSessionModel = {
  async createOTP({ phone, otpCode, expiresAt }) {
    const [created] = await knex(TABLE)
      .insert({
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
      })
      .returning("*");
    return created;
  },

  async findValidOTP({ phone, otpCode }) {
    return knex(TABLE)
      .where({
        phone,
        otp_code: otpCode,
        verified: false,
      })
      .andWhere("expires_at", ">", knex.fn.now())
      .orderBy("created_at", "desc")
      .first();
  },

  async markVerified(id) {
    const [updated] = await knex(TABLE)
      .where({ id })
      .update({ verified: true })
      .returning("*");
    return updated;
  },

  async deleteExpired() {
    return knex(TABLE).where("expires_at", "<", knex.fn.now()).del();
  },
};
