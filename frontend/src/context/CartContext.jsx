// src/context/CartContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { storage } from "../utils/storage"; // giả sử bạn có file storage giống Auth

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true); // giống Auth, để load từ storage

  // Load giỏ hàng từ localStorage khi component mount (giống load user)
  useEffect(() => {
    try {
      const storedCart = storage.getCart(); // bạn cần thêm hàm này vào storage
      if (storedCart && Array.isArray(storedCart)) {
        setCart(storedCart);
      }
    } catch (err) {
      console.error("Lỗi load giỏ hàng từ storage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo key duy nhất cho mỗi item trong giỏ (id + variant_id)
  const getCartKey = (item) =>
    item.variant_id ? `${item.id}_${item.variant_id}` : item.id;

  // Thêm món vào giỏ (cùng món khác variant = khác dòng)
  const addItem = useCallback((item) => {
    setCart((prevCart) => {
      const cartKey = getCartKey(item);
      const exist = prevCart.find((i) => getCartKey(i) === cartKey);
      let newCart;

      if (exist) {
        newCart = prevCart.map((i) =>
          getCartKey(i) === cartKey
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i,
        );
      } else {
        newCart = [
          ...prevCart,
          { ...item, cartKey, quantity: item.quantity || 1 },
        ];
      }

      // Lưu ngay vào storage để persist
      storage.setCart(newCart);
      return newCart;
    });
  }, []);

  // Xóa món theo cartKey (giảm quantity, nếu =1 thì xóa luôn)
  const removeItem = useCallback((cartKey) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => (i.cartKey || i.id) === cartKey);
      let newCart;
      if (item && item.quantity > 1) {
        newCart = prevCart.map((i) =>
          (i.cartKey || i.id) === cartKey
            ? { ...i, quantity: i.quantity - 1 }
            : i,
        );
      } else {
        newCart = prevCart.filter((i) => (i.cartKey || i.id) !== cartKey);
      }
      storage.setCart(newCart);
      return newCart;
    });
  }, []);

  // Xóa hoàn toàn một món khỏi giỏ
  const deleteItem = useCallback((cartKey) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((i) => (i.cartKey || i.id) !== cartKey);
      storage.setCart(newCart);
      return newCart;
    });
  }, []);

  // Xóa toàn bộ giỏ
  const clearCart = useCallback(() => {
    setCart([]);
    storage.clearCart(); // hoặc storage.remove('cart')
  }, []);

  // Tính tổng tiền (hàm tiện ích)
  const getTotal = useCallback(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
      0,
    );
  }, [cart]);

  const value = {
    cart,
    loading,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    getTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook tiện lợi để dùng ở các component khác (giống useAuth)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng bên trong CartProvider");
  }
  return context;
};
