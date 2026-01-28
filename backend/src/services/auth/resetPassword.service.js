import { supabase, supabaseAdmin } from "../../config/supabase.js";

/**
 * Đặt lại mật khẩu mới cho người dùng
 * @param {string} newPassword - Mật khẩu mới
 * @param {string} accessToken - Access token từ Supabase recovery email
 * @returns {Promise<{ user: object, error: object }>}
 */
export const resetPassword = async (newPassword, accessToken) => {
  if (!newPassword || newPassword.length < 6) {
    return {
      user: null,
      error: { message: "Password must be at least 6 characters", status: 400 },
    };
  }

  if (!accessToken) {
    return {
      user: null,
      error: { message: "Access token is required", status: 400 },
    };
  }

  try {
    console.log(
      "Attempting to reset password with token:",
      accessToken.substring(0, 20) + "...",
    );

    // Verify token và lấy user từ token
    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError) {
      console.error("Error getting user from token:", userError);
      return {
        user: null,
        error: {
          message: userError.message || "Invalid or expired token",
          status: 400,
        },
      };
    }

    if (!userData || !userData.user) {
      console.error("No user found from token");
      return {
        user: null,
        error: {
          message: "Invalid or expired token",
          status: 400,
        },
      };
    }

    console.log("User found:", userData.user.id);

    // Dùng admin client để update password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      {
        password: newPassword,
      },
    );

    if (error) {
      console.error("Error updating password:", error);
      return {
        user: null,
        error: {
          message: error.message || "Failed to update password",
          status: error.status || 400,
        },
      };
    }

    console.log("Password updated successfully for user:", data.user.id);
    return { user: data.user, error: null };
  } catch (err) {
    console.error("Unexpected error in resetPassword:", err);
    return {
      user: null,
      error: {
        message: err.message || "An error occurred while resetting password",
        status: 500,
      },
    };
  }
};
