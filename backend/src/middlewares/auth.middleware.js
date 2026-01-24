// middleware/auth.middleware.js
import { supabase } from "../config/supabase.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = data.user; // user Supabase
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
