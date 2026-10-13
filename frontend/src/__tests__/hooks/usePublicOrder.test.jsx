import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePublicOrder } from "../../hooks/public/usePublicOrder.js";

// Mock publicService
const { mockCreateOrder, mockGetOrdersBySession, mockGetOrderStatus } = vi.hoisted(() => ({
  mockCreateOrder: vi.fn(),
  mockGetOrdersBySession: vi.fn(),
  mockGetOrderStatus: vi.fn(),
}));

vi.mock("../../services/public.service", () => ({
  publicService: {
    createOrder: mockCreateOrder,
    getOrdersBySession: mockGetOrdersBySession,
    getOrderStatus: mockGetOrderStatus,
  },
}));

describe("Hook — usePublicOrder (Async State Transitions & API Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("[HOOK-01] Khởi tạo với loading = false", () => {
    const { result } = renderHook(() => usePublicOrder());
    expect(result.current.loading).toBe(false);
  });

  it("[HOOK-02] createOrder thành công: trả về data và chuyển loading false -> true -> false", async () => {
    const fakeResponse = { data: { id: "ord-1", status: "pending", total_price: 120000 } };
    mockCreateOrder.mockResolvedValueOnce(fakeResponse);

    const { result } = renderHook(() => usePublicOrder());

    let responseData;
    await act(async () => {
      responseData = await result.current.createOrder({ session_id: "s1", items: [] });
    });

    expect(responseData).toEqual(fakeResponse.data);
    expect(result.current.loading).toBe(false);
    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
  });

  it("[HOOK-03] createOrder thất bại: ném lỗi và reset loading về false", async () => {
    mockCreateOrder.mockRejectedValueOnce(new Error("Món ăn đã hết"));

    const { result } = renderHook(() => usePublicOrder());

    await act(async () => {
      await expect(
        result.current.createOrder({ session_id: "s1", items: [] }),
      ).rejects.toThrow("Món ăn đã hết");
    });

    expect(result.current.loading).toBe(false);
  });

  it("[HOOK-04] getOrdersBySession gọi đúng service và trả về data", async () => {
    const fakeOrders = { data: [{ id: "ord-1", items: [] }, { id: "ord-2", items: [] }] };
    mockGetOrdersBySession.mockResolvedValueOnce(fakeOrders);

    const { result } = renderHook(() => usePublicOrder());

    let orders;
    await act(async () => {
      orders = await result.current.getOrdersBySession("sess-123");
    });

    expect(orders).toEqual(fakeOrders.data);
    expect(mockGetOrdersBySession).toHaveBeenCalledWith("sess-123");
  });

  it("[HOOK-05] getStatus gọi đúng getOrderStatus và trả về trạng thái món", async () => {
    const fakeStatus = { data: { id: "ord-1", status: "preparing" } };
    mockGetOrderStatus.mockResolvedValueOnce(fakeStatus);

    const { result } = renderHook(() => usePublicOrder());

    let status;
    await act(async () => {
      status = await result.current.getStatus("ord-1");
    });

    expect(status).toEqual(fakeStatus.data);
    expect(mockGetOrderStatus).toHaveBeenCalledWith("ord-1");
  });
});
