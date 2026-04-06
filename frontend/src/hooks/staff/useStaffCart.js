import { useState, useCallback } from "react";

/**
 * Hook quản lý giỏ hàng cho nhân viên đặt món hộ khách.
 * cartItems: [{ itemId, name, price, quantity, note }]
 */
export function useStaffCart() {
  const [cartItems, setCartItems] = useState([]);

  // Thêm món vào giỏ (nếu đã có → tăng quantity)
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          note: "",
        },
      ];
    });
  }, []);

  // Xóa món khỏi giỏ
  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);

  // Tăng/giảm số lượng (amount = +1 hoặc -1)
  const updateQuantity = useCallback((itemId, amount) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.itemId === itemId
            ? { ...i, quantity: Math.max(0, i.quantity + amount) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  // Cập nhật ghi chú
  const updateNote = useCallback((itemId, note) => {
    setCartItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, note } : i)),
    );
  }, []);

  // Xóa toàn bộ giỏ
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Tổng tiền
  const totalAmount = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  // Tổng số món
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Format payload cho API — field name = itemId (khớp với backend)
  const toOrderPayload = () =>
    cartItems.map((i) => ({
      itemId: i.itemId,
      quantity: i.quantity,
      note: i.note || undefined,
    }));

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    clearCart,
    totalAmount,
    totalItems,
    toOrderPayload,
  };
}
