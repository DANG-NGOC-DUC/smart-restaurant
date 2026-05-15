import supabase, { supabaseAdmin } from "../../config/supabase.js";
import { UserModel } from "../../models/user.model.js";
import knex from "../../db/knex.js";

const getUserPermissionKeys = async (userId) => {
  const rows = await knex("user_permissions as up")
    .join("permissions as p", "p.id", "up.permission_id")
    .where("up.user_id", userId)
    .select("p.key");
  return rows.map((row) => row.key);
};

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
    await UserModel.create(newUser);
  } catch (dbError) {
    // Nếu có lỗi khi ghi vào DB (ví dụ: email đã tồn tại), cần xử lý
    // Có thể cần xóa người dùng vừa tạo trên Supabase để đồng bộ
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
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

  if (error || !data?.session) {
    return { session: null, error };
  }

  // Lấy role từ bảng users trong DB
  const dbUser = await UserModel.findById(data.session.user.id);
  const permissionKeys = dbUser ? await getUserPermissionKeys(dbUser.id) : [];
  const session = {
    ...data.session,
    user: {
      ...data.session.user,
      role: dbUser?.role || "guest",
      db_role: dbUser?.role || "guest",
      full_name: dbUser?.full_name || null,
      permissions: permissionKeys,
    },
  };

  return { session, error: null };
};

/**
 * Làm mới access_token bằng refresh_token.
 * @param {string} refreshToken
 * @returns {Promise<{ session: object, error: object }>}
 */
const refreshSession = async (refreshToken) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  return { session: data?.session, error };
};

/**
 * Đăng nhập / đăng ký thực khách bằng Google OAuth.
 * Frontend gửi access_token từ Supabase Auth (Google provider).
 * Backend verify token → tìm/tạo user trong bảng users với role 'guest'.
 */
const loginWithGoogle = async (accessToken) => {
  // 1. Verify token qua Supabase
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) {
    return {
      session: null,
      error: error || { message: "Token không hợp lệ." },
    };
  }

  const authUser = data.user;

  // 2. Tìm user trong DB, nếu chưa có thì tạo mới (role: guest)
  let dbUser = await UserModel.findById(authUser.id);
  if (!dbUser) {
    const meta = authUser.user_metadata || {};
    dbUser = await UserModel.create({
      id: authUser.id,
      full_name: meta.full_name || meta.name || "Khách",
      email: authUser.email,
      phone: null,
      role: "guest",
    });
  }

  // 3. Chỉ cho phép guest đăng nhập bằng Google
  if (dbUser.role !== "guest") {
    return {
      session: null,
      error: {
        message: "Tài khoản nhân viên không được đăng nhập bằng Google.",
        status: 403,
      },
    };
  }

  // 4. Trả session
  return {
    session: {
      access_token: accessToken,
      user: {
        ...authUser,
        role: dbUser.role,
        db_role: dbUser.role,
        full_name: dbUser.full_name,
        phone: dbUser.phone,
        permissions: [],
      },
    },
    error: null,
  };
};

export const authService = {
  register,
  login,
  refreshSession,
  loginWithGoogle,
};
