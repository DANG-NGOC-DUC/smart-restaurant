import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const {
  mockSessionFindById,
  mockMenuItemFindById,
  mockVariantFindById,
  mockDeductInventory,
  mockKnex,
} = vi.hoisted(() => ({
  mockSessionFindById: vi.fn(),
  mockMenuItemFindById: vi.fn(),
  mockVariantFindById: vi.fn(),
  mockDeductInventory: vi.fn(),
  mockKnex: vi.fn(),
}));

vi.mock("../../models/session.model.js", () => ({
  SessionModel: { findById: mockSessionFindById },
}));

vi.mock("../../models/menuItem.model.js", () => ({
  MenuItemModel: { findById: mockMenuItemFindById },
}));

vi.mock("../../models/menuItemVariant.model.js", () => ({
  MenuItemVariantModel: { findById: mockVariantFindById },
}));

vi.mock("../../services/admin/order.service.js", () => ({
  orderService: { deductInventoryForOrder: mockDeductInventory },
}));

vi.mock("../../db/knex.js", () => ({
  default: mockKnex,
}));

import { orderPublicService } from "../../services/public/order.service.js";

describe("OrderPublicService — createOrder (Equivalence Partitioning & Boundary Value Analysis)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Phân vùng tương đương (EP): Session ID ─────────────────────────────────
  describe("Phân vùng tương đương — session_id", () => {
    it("[EP-01] Ném lỗi nếu thiếu session_id (null/undefined)", async () => {
      await expect(
        orderPublicService.createOrder({ session_id: null, items: [{ menu_item_id: "m1", quantity: 1 }] }),
      ).rejects.toThrow("Thiếu session_id.");
    });
  });

  // ── Phân vùng tương đương (EP) & Phân tích giá trị biên (BVA): items ───────
  describe("Phân vùng & Giá trị biên — items", () => {
    it("[EP-02] Ném lỗi nếu items không phải là mảng", async () => {
      await expect(
        orderPublicService.createOrder({ session_id: "sess-1", items: "not-an-array" }),
      ).rejects.toThrow("Đơn hàng phải có ít nhất 1 món.");
    });

    it("[BVA-01] Ném lỗi nếu items là mảng rỗng (length = 0 biên dưới)", async () => {
      await expect(
        orderPublicService.createOrder({ session_id: "sess-1", items: [] }),
      ).rejects.toThrow("Đơn hàng phải có ít nhất 1 món.");
    });

    it("[BVA-02] Ném lỗi nếu quantity = 0 (giá trị không hợp lệ sát biên 1)", async () => {
      mockSessionFindById.mockResolvedValueOnce({ id: "sess-1", status: "open" });
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: 0 }],
        }),
      ).rejects.toThrow("Thông tin món không hợp lệ.");
    });

    it("[BVA-03] Ném lỗi nếu quantity âm (quantity = -1)", async () => {
      mockSessionFindById.mockResolvedValueOnce({ id: "sess-1", status: "open" });
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: -1 }],
        }),
      ).rejects.toThrow("Thông tin món không hợp lệ.");
    });
  });

  // ── Trạng thái phiên ăn (Session Status) ───────────────────────────────────
  describe("Kiểm tra trạng thái phiên ăn (Session validation)", () => {
    it("[EP-03] Ném lỗi nếu phiên không tồn tại trong CSDL", async () => {
      mockSessionFindById.mockResolvedValueOnce(null);
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-999",
          items: [{ menu_item_id: "m1", quantity: 1 }],
        }),
      ).rejects.toThrow("Phiên không tồn tại.");
    });

    it("[EP-04] Ném lỗi nếu phiên đã kết thúc (status != 'open')", async () => {
      mockSessionFindById.mockResolvedValueOnce({ id: "sess-1", status: "closed" });
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: 1 }],
        }),
      ).rejects.toThrow("Phiên đã kết thúc, không thể đặt thêm.");
    });
  });

  // ── Kiểm tra tính khả dụng của món ăn & biến thể (Menu Item & Variant) ─────
  describe("Kiểm tra món ăn và biến thể (Availability & Relationship)", () => {
    beforeEach(() => {
      mockSessionFindById.mockResolvedValue({ id: "sess-1", status: "open" });
    });

    it("[EP-05] Ném lỗi nếu món ăn không tồn tại", async () => {
      mockMenuItemFindById.mockResolvedValueOnce(null);
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m-nonexist", quantity: 1 }],
        }),
      ).rejects.toThrow("Món không tồn tại: m-nonexist");
    });

    it("[EP-06] Ném lỗi nếu món ăn đang ngừng bán (is_available = false)", async () => {
      mockMenuItemFindById.mockResolvedValueOnce({
        id: "m1",
        name: "Phở Bò",
        price: 50000,
        is_available: false,
      });
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: 1 }],
        }),
      ).rejects.toThrow('Món "Phở Bò" hiện đang ngừng bán.');
    });

    it("[EP-07] Ném lỗi nếu biến thể không tồn tại", async () => {
      mockMenuItemFindById.mockResolvedValueOnce({
        id: "m1",
        name: "Trà sữa",
        price: 30000,
        is_available: true,
      });
      mockVariantFindById.mockResolvedValueOnce(null);
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: 1, variant_id: "var-999" }],
        }),
      ).rejects.toThrow("Biến thể không tồn tại.");
    });

    it("[EP-08] Ném lỗi nếu biến thể không thuộc về món ăn này", async () => {
      mockMenuItemFindById.mockResolvedValueOnce({
        id: "m1",
        name: "Trà sữa",
        price: 30000,
        is_available: true,
      });
      mockVariantFindById.mockResolvedValueOnce({
        id: "var-1",
        menu_item_id: "m2", // Khác m1
        is_available: true,
      });
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: 1, variant_id: "var-1" }],
        }),
      ).rejects.toThrow("Biến thể không thuộc món này.");
    });

    it("[EP-09] Ném lỗi nếu biến thể đang tạm ngưng (is_available = false)", async () => {
      mockMenuItemFindById.mockResolvedValueOnce({
        id: "m1",
        name: "Trà sữa",
        price: 30000,
        is_available: true,
      });
      mockVariantFindById.mockResolvedValueOnce({
        id: "var-1",
        menu_item_id: "m1",
        label: "Size L",
        is_available: false,
      });
      await expect(
        orderPublicService.createOrder({
          session_id: "sess-1",
          items: [{ menu_item_id: "m1", quantity: 1, variant_id: "var-1" }],
        }),
      ).rejects.toThrow('Biến thể "Size L" hiện không khả dụng.');
    });
  });

  // ── Kiểm thử chuyển đổi trạng thái (State Transition Testing) & Tính tiền ──
  describe("Kiểm thử chuyển đổi trạng thái (State Transition) & Tính tiền", () => {
    const setupValidMocks = (isFirst) => {
      mockSessionFindById.mockResolvedValue({ id: "sess-1", status: "open" });
      mockMenuItemFindById.mockImplementation(async (id) => {
        if (id === "m1") return { id: "m1", name: "Cơm tấm", price: 40000, is_available: true };
        if (id === "m2") return { id: "m2", name: "Trà đá", price: 5000, is_available: true };
        return null;
      });
      mockVariantFindById.mockImplementation(async (id) => {
        if (id === "v1") return { id: "v1", menu_item_id: "m1", label: "Đặc biệt", price_extra: 15000, is_available: true };
        return null;
      });

      // Knex queries
      const knexQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        whereIn: vi.fn().mockReturnThis(),
        count: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue({ cnt: isFirst ? 0 : 2 }),
      };

      const mockOrderInsert = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "ord-new", session_id: "sess-1" }]),
      });
      const mockOrderItemInsert = vi.fn().mockResolvedValue([]);

      const mockTrx = vi.fn((table) => {
        if (table === "orders") {
          return { insert: mockOrderInsert };
        }
        if (table === "order_items") {
          return { insert: mockOrderItemInsert };
        }
        return {};
      });

      mockKnex.mockImplementation((table) => {
        if (table === "orders") return knexQueryBuilder;
        return knexQueryBuilder;
      });

      mockKnex.transaction = vi.fn().mockImplementation(async (cb) => {
        return cb(mockTrx);
      });

      return { mockTrx, mockOrderInsert, mockOrderItemInsert };
    };

    it("[ST-01] Đặt món lần đầu: status = 'pending', item = 'pending', không trừ kho ngay", async () => {
      const { mockOrderInsert } = setupValidMocks(true);

      const result = await orderPublicService.createOrder({
        session_id: "sess-1",
        items: [
          { menu_item_id: "m1", quantity: 2, variant_id: "v1" }, // (40000 + 15000) * 2 = 110000
          { menu_item_id: "m2", quantity: 1 },                  // 5000 * 1 = 5000
        ],
      });

      expect(result.is_first_order).toBe(true);
      expect(mockDeductInventory).not.toHaveBeenCalled();

      // Kiểm tra tham số insert order
      const ordersInsertCall = mockOrderInsert.mock.calls[0][0];
      expect(ordersInsertCall.status).toBe("pending");
      expect(ordersInsertCall.total_price).toBe(115000); // 110000 + 5000
    });

    it("[ST-02] Đặt món lần 2 trở đi: status = 'active', item = 'preparing', tự động trừ kho", async () => {
      const { mockOrderInsert } = setupValidMocks(false);

      const result = await orderPublicService.createOrder({
        session_id: "sess-1",
        items: [{ menu_item_id: "m2", quantity: 2 }], // 5000 * 2 = 10000
      });

      expect(result.is_first_order).toBe(false);
      expect(mockDeductInventory).toHaveBeenCalledTimes(1);

      const ordersInsertCall = mockOrderInsert.mock.calls[0][0];
      expect(ordersInsertCall.status).toBe("active");
      expect(ordersInsertCall.total_price).toBe(10000);
    });
  });

  // ── Các hàm truy vấn phụ trợ ──────────────────────────────────────────────
  describe("Truy vấn trạng thái (Queries)", () => {
    it("[EP-10] getSessionStatus ném lỗi nếu session không tồn tại", async () => {
      mockSessionFindById.mockResolvedValueOnce(null);
      await expect(orderPublicService.getSessionStatus("invalid-sess")).rejects.toThrow("Phiên không tồn tại.");
    });

    it("[EP-11] getSessionStatus trả về trạng thái hợp lệ", async () => {
      mockSessionFindById.mockResolvedValueOnce({ id: "s1", status: "open" });
      const res = await orderPublicService.getSessionStatus("s1");
      expect(res).toEqual({ status: "open" });
    });

    it("[EP-12] getOrderStatus ném lỗi nếu order không tồn tại", async () => {
      mockKnex.mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
      });
      await expect(orderPublicService.getOrderStatus("ord-999")).rejects.toThrow("Đơn hàng không tồn tại.");
    });
  });
});
