import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Khởi tạo dotenv để đọc file .env (rõ ràng về đường dẫn)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missing = [];
if (!supabaseUrl) missing.push("SUPABASE_URL");
if (!supabaseAnonKey) missing.push("SUPABASE_ANON_KEY");
if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
if (missing.length > 0) {
  throw new Error(
    `Thiếu cấu hình Supabase trong file .env: ${missing.join(", ")}. Kiểm tra file backend/.env hoặc biến môi trường.`,
  );
}

/**
 * 1. Supabase Client thông thường
 * Dùng Service Role Key vì backend cần quyền truy cập đầy đủ
 */

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
);

/**
 * 2. Supabase Admin Client (Privileged)
 * Dùng cho các tác vụ Backend như: tạo user auth,
 * ghi đè quyền truy cập để quản lý quỹ hoặc duyệt yêu cầu.
 */

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Default export cho các file import default
export default supabase;

console.log("Supabase Config: Đã khởi tạo thành công.");
