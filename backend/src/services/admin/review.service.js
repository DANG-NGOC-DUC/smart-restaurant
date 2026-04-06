import knex from "../../db/knex.js";

export const reviewService = {
  async getAll() {
    return knex("reviews")
      .select(
        "reviews.*",
        "users.full_name as user_full_name",
        "reviews.order_id",
      )
      .leftJoin("users", "reviews.user_id", "users.id")
      .orderBy("reviews.created_at", "desc");
  },

  async getLatest(limit = 3) {
    return knex("reviews")
      .select(
        "reviews.id",
        "reviews.rating",
        "reviews.comment",
        "reviews.created_at",
        "users.full_name as user_full_name",
      )
      .leftJoin("users", "reviews.user_id", "users.id")
      .orderBy("reviews.created_at", "desc")
      .limit(limit);
  },
};
