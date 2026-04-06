import { useState, useEffect } from "react";

const QUICK_NOTES = ["Ít cay", "Không hành", "Làm chín kỹ"];

export default function OrderModal({
  item,
  onClose,
  onAddToCart,
  readOnly = false,
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [customNote, setCustomNote] = useState("");
  const [visible, setVisible] = useState(false);

  // Lấy variants từ item (đã được API trả về)
  const variants = item?.variants || [];
  const hasVariants = variants.length > 0;

  // Chọn variant mặc định khi mở modal
  useEffect(() => {
    if (hasVariants) {
      const defaultVariant = variants.find((v) => v.is_default) || variants[0];
      setSelectedVariantId(defaultVariant.id);
    }
  }, [item?.id]);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  if (!item) return null;

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const priceExtra = selectedVariant ? Number(selectedVariant.price_extra) : 0;
  const unitPrice = Number(item.price) + priceExtra;
  const totalPrice = unitPrice * quantity;

  const toggleNote = (note) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note],
    );
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAdd = () => {
    const allNotes = [...selectedNotes, customNote.trim()]
      .filter(Boolean)
      .join(", ");
    onAddToCart({
      ...item,
      price: unitPrice,
      quantity,
      variant_id: selectedVariantId,
      variant_label: selectedVariant?.label || null,
      note: allNotes,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] max-w-md mx-auto">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col bg-white rounded-t-2xl shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "70dvh" }}
      >
        {/* Handle */}
        <div className="flex h-6 w-full items-center justify-center shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-36">
          {/* Header Info */}
          <div className="flex items-start gap-4 py-4 border-b border-slate-100">
            <img
              alt={item.name}
              className="size-20 rounded-lg object-cover shrink-0"
              src={item.image_url}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {item.name}
                  </h2>
                  <p className="text-primary font-bold text-lg mt-1">
                    {unitPrice.toLocaleString("vi-VN")}đ
                    {selectedVariant && (
                      <span className="text-xs font-medium text-slate-400 ml-1.5">
                        {selectedVariant.label}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Size Selection — chỉ hiện khi món có variants */}
          {hasVariants && (
            <div className="mt-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Chọn Size (Bắt buộc)
              </h3>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <label
                    key={variant.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedVariantId === variant.id
                        ? "border-primary bg-primary/5"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        className="custom-radio"
                        checked={selectedVariantId === variant.id}
                        onChange={() => setSelectedVariantId(variant.id)}
                      />
                      <span className="text-sm font-medium">
                        {variant.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {variant.is_default && (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Mặc định
                        </span>
                      )}
                      <span className="text-sm font-semibold">
                        {Number(variant.price_extra) === 0
                          ? `${Number(item.price).toLocaleString("vi-VN")}đ`
                          : `${(Number(item.price) + Number(variant.price_extra)).toLocaleString("vi-VN")}đ`}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quick Notes */}
          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Ghi chú nhanh
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_NOTES.map((note) => (
                <button
                  key={note}
                  onClick={() => toggleNote(note)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedNotes.includes(note)
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
            <textarea
              className="mt-3 w-full h-20 p-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:border-primary placeholder-slate-400 resize-none"
              placeholder="Ghi chú thêm cho nhà bếp..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-slate-100 space-y-4">
          {readOnly ? (
            <div className="text-center py-2">
              <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base">
                  qr_code_scanner
                </span>
                Quét mã QR tại bàn để gọi món
              </p>
            </div>
          ) : (
            <>
              {/* Quantity Selector */}
              <div className="flex justify-center">
                <div className="flex items-center bg-accent/10 rounded-full px-4 py-1.5 border border-accent/30">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex items-center justify-center size-8 text-accent"
                  >
                    <span className="material-symbols-outlined font-bold">
                      remove
                    </span>
                  </button>
                  <span className="px-6 text-lg font-bold text-accent">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex items-center justify-center size-8 text-accent"
                  >
                    <span className="material-symbols-outlined font-bold">
                      add
                    </span>
                  </button>
                </div>
              </div>

              {/* Main CTA */}
              <button
                onClick={handleAdd}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
              >
                THÊM VÀO GIỎ - {totalPrice.toLocaleString("vi-VN")}đ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
