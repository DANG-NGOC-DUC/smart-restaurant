import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useLogin } from "../../hooks/auth/useLogin.js";

// ── Mock react-router-dom navigate ───────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Mock AuthContext ──────────────────────────────────────────────────────────
const mockLogin = vi.fn();
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// ── Wrapper với MemoryRouter (cần cho useNavigate) ────────────────────────────
const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

// ════════════════════════════════════════════════════════════════════════════════
describe("Hook — useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("khởi tạo với state mặc định đúng", () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    expect(result.current.formData).toEqual({ email: "", password: "" });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handleChange cập nhật formData đúng", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.handleChange({
        target: { name: "email", value: "test@test.com" },
      });
    });
    expect(result.current.formData.email).toBe("test@test.com");
  });

  it("handleChange xóa error khi user bắt đầu gõ", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    // Gây ra lỗi trước
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).not.toBeNull();

    // Gõ để xóa lỗi
    await act(async () => {
      result.current.handleChange({
        target: { name: "email", value: "a" },
      });
    });
    expect(result.current.error).toBeNull();
  });

  it("set error nếu submit khi thiếu email", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).toBe("Vui lòng nhập đầy đủ thông tin.");
    expect(result.current.loading).toBe(false);
  });

  it("navigate đến /staff nếu role là 'staff'", async () => {
    mockLogin.mockResolvedValueOnce({
      user: { role: "staff" },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      result.current.handleChange({
        target: { name: "email", value: "staff@test.com" },
      });
      result.current.handleChange({
        target: { name: "password", value: "pass123" },
      });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/staff");
  });

  it("navigate đến /admin nếu role là 'admin'", async () => {
    mockLogin.mockResolvedValueOnce({ user: { role: "admin" } });
    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.handleChange({ target: { name: "email", value: "a@a.com" } });
      result.current.handleChange({ target: { name: "password", value: "p" } });
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("navigate đến / nếu role là 'guest' (default)", async () => {
    mockLogin.mockResolvedValueOnce({ user: { role: "guest" } });
    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.handleChange({ target: { name: "email", value: "g@g.com" } });
      result.current.handleChange({ target: { name: "password", value: "p" } });
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("set error nếu login thất bại (axios error)", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: "Invalid credentials" } },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.handleChange({ target: { name: "email", value: "a@a.com" } });
      result.current.handleChange({ target: { name: "password", value: "wrong" } });
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).toBe("Invalid credentials");
    expect(result.current.loading).toBe(false);
  });

  it("clearError xóa error hiện tại", async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    // Gây lỗi
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).not.toBeNull();

    // Clear
    await act(async () => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("loading = true trong suốt quá trình gọi API", async () => {
    let resolveLogin;
    mockLogin.mockImplementationOnce(
      () => new Promise((resolve) => { resolveLogin = resolve; })
    );

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.handleChange({ target: { name: "email", value: "a@a.com" } });
      result.current.handleChange({ target: { name: "password", value: "p" } });
    });

    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    // Trong khi đang chờ API — loading phải là true
    expect(result.current.loading).toBe(true);

    // Khi API xong
    await act(async () => {
      resolveLogin({ user: { role: "guest" } });
    });
    expect(result.current.loading).toBe(false);
  });
});
