// Thẻ hiển thị thông tin món ăn trong kho
function InventoryCard({ item }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-52 bg-slate-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm font-semibold">
            Không có ảnh
          </div>
        )}

        {item.status === "out" && (
          <>
            <div className="absolute inset-0 bg-slate-900/60" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
              Hết hàng
            </div>
          </>
        )}
      </div>

      <div className="p-3">
        <div className="min-w-0">
          <h3 className="font-medium text-sea-800 truncate text-sm">
            {item.name}
          </h3>
          <p className="text-xs text-sea-500 mt-1">{item.category}</p>
        </div>

        {item.description && (
          <p className="mt-2 text-[11px] text-sea-400 line-clamp-2">
            {item.description}
          </p>
        )}

        <p className="mt-3 text-base font-bold text-coral-600">
          {Number(item.price).toLocaleString("vi-VN")} đ
        </p>
      </div>
    </div>
  );
}

export default InventoryCard;
