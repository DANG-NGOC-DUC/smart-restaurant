import express from "express";
import { menuPublicService } from "../../services/public/menu.service.js";

const router = express.Router();

/**
 * GET /api/public/menu
 * Query:
 *  - category_id
 *  - search
 */
router.get("/", async (req, res) => {
  try {
    const { category_id, search } = req.query;

    const data = await menuPublicService.getPublicMenu({
      category_id,
      search,
    });

    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /api/public/menu/grouped
 * Trả menu theo danh mục
 */
router.get("/grouped", async (req, res) => {
  try {
    const data = await menuPublicService.getMenuGroupedByCategory();
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /api/public/menu/:id
 * Chi tiết 1 món
 */
router.get("/:id", async (req, res) => {
  try {
    const data = await menuPublicService.getMenuItemDetail(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
