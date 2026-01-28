import { supabase } from "../../config/supabase.js";

export const sendResetPasswordEmail = async (email) => {
  if (!email) return { error: { message: "Email is required" } };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5173/reset-password",
  });
  return { error };
};
