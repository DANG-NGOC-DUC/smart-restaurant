import { authService } from "../../services/auth/auth.service.js";

export const register = async (req, res) => {
  const { fullName, phone, email, password } = req.body;

  if (!fullName || !phone || !email || !password) {
    return res
      .status(400)
      .json({ error: "Full name, phone, email and password are required." });
  }

  const { user, error } = await authService.register(
    fullName,
    phone,
    email,
    password,
  );

  if (error) {
    // Supabase returns status 400 for cases like weak password, existing email
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    // Other errors
    return res.status(500).json({ error: error.message });
  }

  // Supabase requires email verification by default, so the initial session might be null.
  // Return the user object so the frontend can display a "Please verify your email" message.
  return res.status(201).json({
    message: "Đăng ký thành công!",
    user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const { session, error } = await authService.login(email, password);

  if (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }

  return res.status(200).json(session);
};
