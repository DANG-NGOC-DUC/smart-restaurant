import { authService } from "../../services/auth/auth.service.js";

export const register = async (req, res) => {
  try {
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
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const { session, error } = await authService.login(email, password);

    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(session);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "refresh_token is required." });
    }

    const { session, error } = await authService.refreshSession(refresh_token);

    if (error || !session) {
      return res
        .status(401)
        .json({ error: error?.message || "Unable to refresh token" });
    }

    return res.status(200).json(session);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};

/**
 * GOOGLE LOGIN — chỉ dành cho thực khách (guest)
 * Body: { access_token }
 */
export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: "access_token is required." });
    }

    const { session, error } = await authService.loginWithGoogle(access_token);

    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }

    return res.status(200).json(session);
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
};
