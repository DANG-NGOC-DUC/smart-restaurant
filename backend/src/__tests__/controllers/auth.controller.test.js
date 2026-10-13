import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock authService trước khi import controller ──────────────────────────────
vi.mock("../../services/auth/auth.service.js", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    refreshSession: vi.fn(),
    loginWithGoogle: vi.fn(),
  },
}));

import { authService } from "../../services/auth/auth.service.js";
import {
  register,
  login,
  refreshToken,
  googleLogin,
} from "../../controllers/auth/auth.controller.js";

// ── Helper: tạo mock req/res ──────────────────────────────────────────────────
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// ════════════════════════════════════════════════════════════════════════════════
describe("AuthController — register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu fullName", async () => {
    const req = mockReq({ phone: "0901", email: "a@a.com", password: "123" });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  it("400 nếu thiếu password", async () => {
    const req = mockReq({ fullName: "Duc", phone: "0901", email: "a@a.com" });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("201 nếu đăng ký thành công", async () => {
    authService.register.mockResolvedValueOnce({
      user: { id: "uid-1", email: "a@a.com" },
      error: null,
    });
    const req = mockReq({
      fullName: "Duc",
      phone: "0901",
      email: "a@a.com",
      password: "Secure123!",
    });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it("500 nếu service ném lỗi không xác định", async () => {
    authService.register.mockResolvedValueOnce({
      user: null,
      error: { message: "DB error" },
    });
    const req = mockReq({
      fullName: "Duc",
      phone: "0901",
      email: "a@a.com",
      password: "Secure123!",
    });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("trả đúng status code từ lỗi Supabase (ví dụ: 422)", async () => {
    authService.register.mockResolvedValueOnce({
      user: null,
      error: { message: "Weak password", status: 422 },
    });
    const req = mockReq({
      fullName: "Duc",
      phone: "0901",
      email: "a@a.com",
      password: "123",
    });
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
describe("AuthController — login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu email", async () => {
    const req = mockReq({ password: "abc" });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400 nếu thiếu password", async () => {
    const req = mockReq({ email: "a@a.com" });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("200 khi đăng nhập thành công", async () => {
    authService.login.mockResolvedValueOnce({
      session: { access_token: "tok", user: { role: "guest" } },
      error: null,
    });
    const req = mockReq({ email: "a@a.com", password: "Secure123!" });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: "tok" })
    );
  });

  it("400 khi sai credentials", async () => {
    authService.login.mockResolvedValueOnce({
      session: null,
      error: { message: "Invalid credentials", status: 400 },
    });
    const req = mockReq({ email: "a@a.com", password: "wrong" });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
describe("AuthController — refreshToken", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu refresh_token", async () => {
    const req = mockReq({});
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("401 nếu token không hợp lệ", async () => {
    authService.refreshSession.mockResolvedValueOnce({
      session: null,
      error: { message: "Token expired" },
    });
    const req = mockReq({ refresh_token: "bad-token" });
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("200 khi refresh thành công", async () => {
    authService.refreshSession.mockResolvedValueOnce({
      session: { access_token: "new-tok" },
      error: null,
    });
    const req = mockReq({ refresh_token: "valid-token" });
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ════════════════════════════════════════════════════════════════════════════════
describe("AuthController — googleLogin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu access_token", async () => {
    const req = mockReq({});
    const res = mockRes();
    await googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("200 khi đăng nhập Google thành công", async () => {
    authService.loginWithGoogle.mockResolvedValueOnce({
      session: { access_token: "google-tok", user: { role: "guest" } },
      error: null,
    });
    const req = mockReq({ access_token: "google-tok" });
    const res = mockRes();
    await googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("403 khi nhân viên cố đăng nhập bằng Google", async () => {
    authService.loginWithGoogle.mockResolvedValueOnce({
      session: null,
      error: {
        message: "Tài khoản nhân viên không được đăng nhập bằng Google.",
        status: 403,
      },
    });
    const req = mockReq({ access_token: "staff-tok" });
    const res = mockRes();
    await googleLogin(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
