import { resetPassword } from "../../services/auth/resetPassword.service.js";

export const resetPasswordController = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res
        .status(400)
        .json({ error: "Password and token are required." });
    }

    const { user, error } = await resetPassword(password, token);

    if (error) {
      console.error("Reset password error:", error);
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json({
      message: "Password reset successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Reset password controller error:", err);
    return res.status(500).json({
      error: err.message || "An error occurred while resetting password",
    });
  }
};
