// Thẻ hiển thị thông tin món ăn trong kho
function InventoryCard({ item, onToggle }) {
  const isAvailable = item.status !== "out";

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

        {!isAvailable && (
          <>
            <div className="absolute inset-0 bg-slate-900/60" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
              Hết hàng
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-800 truncate text-[15px]">
              {item.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{item.category}</p>
          </div>
          
          <button
            onClick={() => onToggle && onToggle(item.id, !isAvailable)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAvailable ? 'bg-[#0f5f63]' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={isAvailable}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {item.description && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        <p className="mt-3 text-sm font-bold text-coral-600">
          {Number(item.price).toLocaleString("vi-VN")} đ
        </p>
      </div>
    </div>
  );
}

export default InventoryCard;
