import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

/**
 * Panel giỏ hàng: danh sách món đã chọn + ghi chú + nút gửi bếp.
 */
function CartPanel({
  cartItems,
  totalAmount,
  totalItems,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveFromCart,
  onClearCart,
  onSubmit,
  isSubmitting,
  tableName,
}) {
  const [expandedNote, setExpandedNote] = useState(null);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 px-4">
        <ShoppingBag className="w-12 h-12 mb-3 text-slate-300" />
        <p className="text-sm font-medium">Giỏ hàng trống</p>
        <p className="text-xs mt-1 text-center">
          Chọn món từ thực đơn bên trái để thêm vào giỏ
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          Giỏ hàng ({totalItems} món)
        </h3>
        <button
          onClick={onClearCart}
          className="text-xs text-slate-400 hover:text-coral-600 transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {cartItems.map((item) => (
          <div
            key={item.itemId}
            className="bg-white rounded-xl border border-slate-200 p-3"
          >
            {/* Row: name + price + remove */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-coral-600 font-medium mt-0.5">
                  {formatMoney(item.price)}
                </p>
              </div>
              <button
                onClick={() => onRemoveFromCart(item.itemId)}
                className="shrink-0 p-1 text-slate-400 hover:text-coral-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Row: quantity controls + subtotal */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onUpdateQuantity(item.itemId, -1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.itemId, 1)}
                  className="w-7 h-7 rounded-lg bg-sea-50 flex items-center justify-center text-sea-700 hover:bg-sea-100 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {formatMoney(item.price * item.quantity)}
              </span>
            </div>

            {/* Note toggle */}
            <button
              onClick={() =>
                setExpandedNote(
                  expandedNote === item.itemId ? null : item.itemId,
                )
              }
              className="flex items-center gap-1 mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {expandedNote === item.itemId ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>
                {item.note ? `Ghi chú: ${item.note}` : "Thêm ghi chú"}
              </span>
            </button>

            {/* Note input */}
            {expandedNote === item.itemId && (
              <input
                type="text"
                value={item.note}
                onChange={(e) => onUpdateNote(item.itemId, e.target.value)}
                placeholder="VD: ít cay, không hành..."
                className="mt-2 w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sea-500/20 focus:bg-white transition-all border border-slate-200"
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer: total + submit */}
      <div className="border-t border-slate-200 px-4 py-3 space-y-3 bg-white">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Tổng cộng</span>
          <span className="text-lg font-bold text-slate-900">
            {formatMoney(totalAmount)}
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-sea-700 text-white font-semibold rounded-xl hover:bg-sea-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? "Đang gửi..." : `Gửi bếp · ${tableName}`}</span>
        </button>
      </div>
    </div>
  );
}

export default CartPanel;
