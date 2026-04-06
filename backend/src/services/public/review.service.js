import { ReviewModel } from "../../models/review.model.js";
import { SessionModel } from "../../models/session.model.js";
import knex from "../../db/knex.js";

const createReview = async ({ session_id, rating, comment }) => {
  if (!session_id) throw new Error("Thiếu session_id.");
  if (!rating || rating < 1 || rating > 5)
    throw new Error("Rating phải từ 1 đến 5.");

  const session = await SessionModel.findById(session_id);
  if (!session) throw new Error("Phiên không tồn tại.");

  // Check duplicate
  const existing = await knex("reviews").where({ session_id }).first();
  if (existing) throw new Error("Bạn đã đánh giá phiên này rồi.");

  const review = await ReviewModel.create({
    session_id,
    user_id: session.user_id || null,
    rating,
    comment: comment || null,
  });

  return review;
};

const getBySession = async (session_id) => {
  return knex("reviews").where({ session_id }).first();
};

export const reviewPublicService = { createReview, getBySession };
