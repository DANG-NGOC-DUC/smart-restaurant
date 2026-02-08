import supabase from "../../config/supabase.js";
import db from "../../db/knex.js";

/**
 * Đăng ký người dùng mới bằng email và mật khẩu qua Supabase Auth.
 * Sau khi đăng ký thành công trên Supabase, tự động tạo một hồ sơ người dùng
 * trong bảng `users` của hệ thống với vai trò 'guest'.
 * @param {string} fullName
 * @param {string} phone
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, session: object, error: object }>}
 */
const register = async (fullName, phone, email, password) => {
  // 1. Gọi Supabase để đăng ký người dùng
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (authError) {
    return { user: null, session: null, error: authError };
  }

  // Nếu người dùng đã tồn tại nhưng chưa xác thực, authError sẽ null
  // nhưng user.identities rỗng. Trường hợp này cũng là lỗi.
  if (
    authData.user &&
    authData.user.identities &&
    authData.user.identities.length === 0
  ) {
    return {
      user: null,
      session: null,
      error: { message: "User already exists but is unconfirmed." },
    };
  }

  // 2. Nếu đăng ký trên Supabase thành công, tạo bản ghi trong bảng `users` của bạn
  const newUser = {
    id: authData.user.id, // Dùng ID từ Supabase làm khóa chính
    full_name: fullName,
    phone: phone,
    email: authData.user.email,
    role: "guest", // Mặc định là guest
  };

  try {
    await db("users").insert(newUser);
  } catch (dbError) {
    // Nếu có lỗi khi ghi vào DB (ví dụ: email đã tồn tại), cần xử lý
    // Có thể cần xóa người dùng vừa tạo trên Supabase để đồng bộ
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { user: null, session: null, error: dbError };
  }

  return { user: authData.user, session: authData.session, error: null };
};

/**
 * Đăng nhập người dùng bằng email và mật khẩu qua Supabase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ session: object, error: object }>}
 */
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { session: data.session, error };
};

export const authService = {
  register,
  login,
};
