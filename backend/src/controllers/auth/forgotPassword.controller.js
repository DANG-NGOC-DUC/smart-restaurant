import { sendResetPasswordEmail } from "../../services/auth/forgotPassword.service.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { error } = await sendResetPasswordEmail(email);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Password reset email sent" });
};
