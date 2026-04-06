import express from "express";
import { reviewPublicService } from "../../services/public/review.service.js";

const router = express.Router();

// POST /api/public/reviews — Tạo đánh giá (không cần auth, dùng session_id)
router.post("/", async (req, res) => {
  try {
    const { session_id, rating, comment } = req.body;
    const review = await reviewPublicService.createReview({
      session_id,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/public/reviews/session/:sessionId — Kiểm tra đã đánh giá chưa
router.get("/session/:sessionId", async (req, res) => {
  try {
    const review = await reviewPublicService.getBySession(req.params.sessionId);
    res.json({ reviewed: !!review, review: review || null });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
