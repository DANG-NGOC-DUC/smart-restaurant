import { reviewService } from "../../services/admin/review.service.js";

const getAll = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAll();
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

const getLatest = async (req, res, next) => {
  try {
    const reviews = await reviewService.getLatest(3);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const reviewController = { getAll, getLatest };
