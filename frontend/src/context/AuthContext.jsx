import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { storage } from "../utils/storage";
import * as authService from "../services/auth.service";
import { publicService } from "../services/public.service";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra user khi load app
  useEffect(() => {
    const storedUser = storage.getUser();
    const token = storage.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Đăng nhập
  const login = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(data);
      // Backend trả về session object từ Supabase có access_token và user
      const session = res.data;
      if (session && session.access_token) {
        storage.setToken(session.access_token);
        if (session.refresh_token) {
          storage.setRefreshToken(session.refresh_token);
        }
        storage.setUser(session.user);
        setUser(session.user);
        setLoading(false);
        return { success: true, user: session.user };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Đăng nhập thất bại";
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
  }, []);

  // Cập nhật hồ sơ thực khách (tên + SĐT)
  const updateProfile = useCallback(async ({ full_name, phone }) => {
    const res = await publicService.updateProfile({ full_name, phone });
    const updated = res.data;
    // Merge vào user hiện tại và lưu storage
    setUser((prev) => {
      const next = {
        ...prev,
        full_name: updated.full_name,
        phone: updated.phone,
      };
      storage.setUser(next);
      return next;
    });
    return updated;
  }, []);

  // Đăng nhập bằng Google (chỉ dành cho thực khách)
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
      // Supabase sẽ redirect sang Google, không cần xử lý gì thêm
    } catch (err) {
      setError(err.message || "Đăng nhập Google thất bại");
      setLoading(false);
      throw err;
    }
  }, []);

  // Xử lý callback sau khi Google redirect về
  const handleGoogleCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data?.session) {
        throw sessionError || new Error("Không lấy được phiên đăng nhập.");
      }

      const accessToken = data.session.access_token;

      // Gọi backend để tìm/tạo user trong DB
      const res = await authService.googleLogin(accessToken);
      const session = res.data;

      storage.setToken(session.access_token);
      storage.setUser(session.user);
      setUser(session.user);
      return { success: true, user: session.user };
    } catch (err) {
      const msg =
        err.response?.data?.error || err.message || "Đăng nhập Google thất bại";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        loginWithGoogle,
        handleGoogleCallback,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
