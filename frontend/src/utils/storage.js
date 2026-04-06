const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";
const CART_KEY = "cart";
const SESSION_KEY = "public_session";

export const storage = {
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setCart: (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart)),
  getCart: () => {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : null;
  },
  clearCart: () => localStorage.removeItem(CART_KEY),
  // Public session (QR scan) — dùng sessionStorage: tồn tại khi refresh, xóa khi đóng tab
  setSession: (session) =>
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)),
  getSession: () => {
    // Dọn session cũ từ localStorage nếu còn sót
    if (localStorage.getItem(SESSION_KEY)) {
      localStorage.removeItem(SESSION_KEY);
    }
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  clearSession: () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CART_KEY);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
