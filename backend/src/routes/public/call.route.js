import express from "express";
import { callPublicService } from "../../services/public/call.service.js";

const router = express.Router();

/**
 * POST /api/public/service-requests
 * Body: { table_id, session_id?, request_type?, note? }
 * request_type: call_waiter | request_bill | need_help
 */
router.post("/", async (req, res) => {
  try {
    const { table_id, session_id, request_type, note } = req.body;
    const result = await callPublicService.createServiceRequest({
      table_id,
      session_id,
      request_type,
      note,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
