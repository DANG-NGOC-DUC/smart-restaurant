import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useSession } from "../../context/SessionContext";
import { usePublicOrder } from "../../hooks/public/usePublicOrder";

function Cart() {
  const navigate = useNavigate();
  const { cart, addItem, removeItem, deleteItem, clearCart } = useCart();
  const { tableName, sessionId } = useSession();
  const { createOrder, loading: orderLoading } = usePublicOrder();
  const [note, setNote] = useState("");
  const [orderError, setOrderError] = useState(null);

  const items = cart;

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + Number(i.price || 0) * (i.quantity || 1),
    0,
  );

  const handleOrder = async () => {
    if (!sessionId) {
      setOrderError("Chưa quét mã QR bàn. Vui lòng quét mã QR để bắt đầu.");
      return;
    }
    if (items.length === 0) return;

    setOrderError(null);
    try {
      const orderItems = items.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity || 1,
        note: item.note || note || null,
        variant_id: item.variant_id || null,
      }));
      const result = await createOrder({
        session_id: sessionId,
        items: orderItems,
      });
      clearCart();
      // Lần đầu → chờ duyệt, lần 2+ → gửi thẳng bếp
      if (result?.is_first_order) {
        navigate("/order-status", {
          replace: true,
          state: { message: "Đã gửi! Chờ nhân viên xác nhận đơn hàng." },
        });
      } else {
        navigate("/order-status", {
          replace: true,
          state: { message: "Đã gửi xuống bếp! Món sẽ được chuẩn bị ngay." },
        });
      }
    } catch (err) {
      setOrderError(
        err?.response?.data?.error || "Gọi món thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className="relative flex flex-col min-h-dvh pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center size-10 rounded-full bg-white shadow-sm border border-slate-100"
          >
            <span className="material-symbols-outlined text-primary">
              arrow_back_ios_new
            </span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-primary font-bold tracking-tighter text-xl">
              SEAFOOD
            </span>
          </div>
          <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-primary text-xs font-bold">
              {tableName || "Chưa quét QR"}
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 px-1">GIỎ HÀNG</h1>
      </header>

      {/* Cart Items List */}
      <div className="flex flex-col gap-3 px-4 mt-2">
        {items.length === 0 && (
          <p className="text-center text-slate-400 py-10">
            Chưa có món nào trong giỏ.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.cartKey || item.id}
            className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-50"
          >
            <div className="size-24 rounded-lg overflow-hidden shrink-0">
              {item.image_url ? (
                <img
                  className="w-full h-full object-cover"
                  src={item.image_url}
                  alt={item.name}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 text-3xl">
                    restaurant
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between flex-1 py-1">
              <div>
                <h3 className="font-bold text-base leading-tight">
                  {item.name}
                </h3>
                {item.variant_label && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.variant_label}
                  </p>
                )}
                <p className="text-primary font-semibold mt-1">
                  {Number(item.price).toLocaleString("vi-VN")}đ
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-accent/10 rounded-full p-1 border border-accent/20">
                  <button
                    onClick={() => removeItem(item.cartKey || item.id)}
                    className="size-7 flex items-center justify-center rounded-full bg-white text-accent font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 font-bold text-slate-800">
                    {item.quantity || 1}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    className="size-7 flex items-center justify-center rounded-full bg-accent text-white font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => deleteItem(item.cartKey || item.id)}
                  className="text-slate-400 hover:text-accent transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen Note Box */}
      <div className="px-4 mt-6">
        <h4 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
          Ghi chú cho nhà bếp
        </h4>
        <div className="relative">
          <textarea
            className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:border-primary placeholder-slate-400 resize-none"
            placeholder="VD: Món ra cùng lúc, ít cay, không hành..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="absolute bottom-3 right-3 text-slate-300">
            <span className="material-symbols-outlined text-[18px]">
              edit_note
            </span>
          </div>
        </div>
      </div>

      {/* Summary Area */}
      <div className="px-4 mt-8 space-y-2">
        <div className="flex justify-between items-center text-slate-500">
          <span className="text-sm font-medium">
            Tạm tính ({totalItems} món)
          </span>
          <span className="text-sm font-semibold">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-slate-900 uppercase tracking-tight">
            Tổng tiền
          </span>
          <span className="text-2xl font-bold text-accent">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-background-light/95 backdrop-blur-md">
        {orderError && (
          <p className="text-red-500 text-xs text-center mb-2">{orderError}</p>
        )}
        <button
          onClick={handleOrder}
          disabled={orderLoading || items.length === 0}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">restaurant_menu</span>
          GỌI MÓN NGAY
        </button>
      </div>
    </div>
  );
}

export default Cart;
