import { describe, it, expect, vi, beforeEach } from "vitest";

// ── vi.hoisted: khai báo trước khi vi.mock bị hoist ───────────────────────────
const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

// ── Mock Supabase ─────────────────────────────────────────────────────────────
vi.mock("../../config/supabase.js", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
  },
  default: {
    auth: { getUser: mockGetUser },
  },
}));

import { auth } from "../../middlewares/auth.middleware.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeReq = (authHeader) => ({
  headers: { authorization: authHeader },
});
const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
const next = vi.fn();

// ════════════════════════════════════════════════════════════════════════════════
describe("auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("401 nếu không có Authorization header", async () => {
    const req = makeReq(undefined);
    const res = makeRes();
    await auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("401 nếu token không hợp lệ (Supabase trả lỗi)", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "JWT expired" },
    });
    const req = makeReq("Bearer invalid-token");
    const res = makeRes();
    await auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("401 nếu Supabase trả user null dù không có error", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const req = makeReq("Bearer some-token");
    const res = makeRes();
    await auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("gọi next() và gán req.user nếu token hợp lệ", async () => {
    const fakeUser = { id: "user-123", email: "test@test.com" };
    mockGetUser.mockResolvedValueOnce({
      data: { user: fakeUser },
      error: null,
    });
    const req = makeReq("Bearer valid-token");
    const res = makeRes();
    await auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(fakeUser);
  });

  it("xử lý đúng Bearer prefix — chỉ gửi phần token thuần", async () => {
    const fakeUser = { id: "u1", email: "u@u.com" };
    mockGetUser.mockResolvedValueOnce({
      data: { user: fakeUser },
      error: null,
    });
    const req = makeReq("Bearer abc.def.ghi");
    const res = makeRes();
    await auth(req, res, next);
    expect(mockGetUser).toHaveBeenCalledWith("abc.def.ghi");
  });
});
