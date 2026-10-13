import { describe, it, expect, vi, beforeEach } from "vitest";

// ── vi.hoisted: khai báo trước khi vi.mock bị hoist ───────────────────────────
const { mockFindById } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
}));

vi.mock("../../models/user.model.js", () => ({
  UserModel: {
    findById: mockFindById,
  },
}));

import { allowRoles } from "../../middlewares/role.middleware.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
const next = vi.fn();

// ════════════════════════════════════════════════════════════════════════════════
describe("allowRoles middleware", () => {
  beforeEach(() => vi.clearAllMocks());

  it("403 nếu req.user không có id", async () => {
    const middleware = allowRoles("admin");
    const req = { user: {} };
    const res = makeRes();
    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("403 nếu user không có role và không tìm được trong DB", async () => {
    mockFindById.mockResolvedValueOnce(null);
    const middleware = allowRoles("admin");
    const req = { user: { id: "uid-1" } };
    const res = makeRes();
    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("403 nếu role không nằm trong danh sách cho phép", async () => {
    const middleware = allowRoles("admin");
    const req = { user: { id: "uid-1", user_metadata: { role: "guest" } } };
    const res = makeRes();
    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Forbidden: insufficient role" })
    );
  });

  it("gọi next() nếu role khớp với metadata", async () => {
    const middleware = allowRoles("admin", "staff");
    const req = { user: { id: "uid-1", user_metadata: { role: "admin" } } };
    const res = makeRes();
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("lấy role từ DB nếu không có trong metadata", async () => {
    mockFindById.mockResolvedValueOnce({ id: "uid-2", role: "staff" });
    const middleware = allowRoles("staff");
    const req = { user: { id: "uid-2" } };
    const res = makeRes();
    await middleware(req, res, next);
    expect(mockFindById).toHaveBeenCalledWith("uid-2");
    expect(next).toHaveBeenCalled();
  });

  it("500 nếu DB ném lỗi khi lấy role", async () => {
    mockFindById.mockRejectedValueOnce(new Error("DB connection error"));
    const middleware = allowRoles("admin");
    const req = { user: { id: "uid-3" } };
    const res = makeRes();
    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("cho phép nhiều roles — khớp role thứ hai", async () => {
    const middleware = allowRoles("admin", "cashier");
    const req = {
      user: { id: "uid-4", user_metadata: { role: "cashier" } },
    };
    const res = makeRes();
    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
