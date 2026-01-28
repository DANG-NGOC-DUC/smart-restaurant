import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { storage } from "../utils/storage";
import * as authService from "../services/auth.service";

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
        storage.setUser(session.user);
        setUser(session.user);
        setLoading(false);
        return { success: true };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Đăng nhập thất bại";
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

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
