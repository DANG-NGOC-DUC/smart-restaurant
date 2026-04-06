import { UserModel } from "../../models/user.model.js";

/**
 * PATCH /api/public/profile
 * Cập nhật tên và số điện thoại cho thực khách đã đăng nhập
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Chưa đăng nhập." });

    const { full_name, phone } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: "Tên không được để trống." });
    }
    if (!phone || !phone.trim()) {
      return res
        .status(400)
        .json({ error: "Số điện thoại không được để trống." });
    }

    const updated = await UserModel.update(userId, {
      full_name: full_name.trim(),
      phone: phone.trim(),
    });

    if (!updated)
      return res.status(404).json({ error: "Không tìm thấy người dùng." });

    res.json({ full_name: updated.full_name, phone: updated.phone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
