import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";

// ── Mock tất cả external deps trước khi import app ───────────────────────────
vi.mock("../../config/supabase.js", () => ({
  default: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      refreshSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
  supabaseAdmin: {
    auth: {
      admin: { deleteUser: vi.fn() },
    },
  },
}));

vi.mock("../../db/knex.js", () => ({
  default: vi.fn(() => ({
    join: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue([]),
    first: vi.fn().mockResolvedValue(null),
  })),
}));

vi.mock("../../models/user.model.js", () => ({
  UserModel: {
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

// ── Import services để mock responses ────────────────────────────────────────
import { authService } from "../../services/auth/auth.service.js";

vi.mock("../../services/auth/auth.service.js", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshSession: vi.fn(),
    loginWithGoogle: vi.fn(),
  },
}));

import app from "../../app.js";

// ════════════════════════════════════════════════════════════════════════════════
describe("API Integration — POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "abc123" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("400 nếu thiếu password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(400);
  });

  it("200 với session đầy đủ khi đăng nhập thành công", async () => {
    authService.login.mockResolvedValueOnce({
      session: {
        access_token: "tok-123",
        refresh_token: "ref-456",
        user: { id: "u1", email: "test@test.com", role: "guest" },
      },
      error: null,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "Secure123!" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(res.body).toHaveProperty("user");
  });

  it("400 khi credentials sai", async () => {
    authService.login.mockResolvedValueOnce({
      session: null,
      error: { message: "Invalid login credentials", status: 400 },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "wrong" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid");
  });
});

// ════════════════════════════════════════════════════════════════════════════════
describe("API Integration — POST /api/auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu các trường bắt buộc", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@a.com" });
    expect(res.status).toBe(400);
  });

  it("201 khi đăng ký thành công", async () => {
    authService.register.mockResolvedValueOnce({
      user: { id: "u2", email: "new@test.com" },
      error: null,
    });

    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      phone: "0901234567",
      email: "new@test.com",
      password: "Secure123!",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("user");
  });
});

// ════════════════════════════════════════════════════════════════════════════════
describe("API Integration — POST /api/auth/refresh-token", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 nếu thiếu refresh_token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({});
    expect(res.status).toBe(400);
  });

  it("401 nếu refresh token hết hạn", async () => {
    authService.refreshSession.mockResolvedValueOnce({
      session: null,
      error: { message: "Token expired" },
    });
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refresh_token: "expired" });
    expect(res.status).toBe(401);
  });

  it("200 khi refresh thành công", async () => {
    authService.refreshSession.mockResolvedValueOnce({
      session: { access_token: "new-tok" },
      error: null,
    });
    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refresh_token: "valid-ref" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token", "new-tok");
  });
});
