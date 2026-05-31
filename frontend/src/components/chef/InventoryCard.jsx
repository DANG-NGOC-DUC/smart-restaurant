function InventoryCard({ item }) {
  const statusConfig = {
    available: {
      label: "CÒN HÀNG",

      badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",

      button: "bg-emerald-500 text-white shadow-md shadow-emerald-100",
    },

    low: {
      label: "SẮP HẾT",

      badge: "bg-amber-50 text-amber-700 border border-amber-100",

      button: "bg-amber-500 text-white shadow-md shadow-amber-100",
    },

    out: {
      label: "HẾT MÓN",

      badge: "bg-rose-50 text-rose-700 border border-rose-100",

      button: "bg-rose-500 text-white shadow-md shadow-rose-100",
    },
  };

  const currentStatus = statusConfig[item.status];

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* IMAGE */}
      <div className="relative p-3 pb-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-[220px] w-full rounded-[18px] object-cover"
        />

        <div className="pointer-events-none absolute inset-x-3 bottom-0 h-16 rounded-b-[18px] bg-gradient-to-t from-slate-900/15 to-transparent"></div>

        {/* STATUS */}
        <div
          className={`absolute right-5 top-5 inline-flex h-8 items-center justify-center rounded-full px-3 text-[11px] font-semibold tracking-[0.12em] ${currentStatus.badge}`}
        >
          {currentStatus.label}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-4 pt-3">
        {/* TITLE */}
        <h3 className="min-h-[40px] text-[15px] font-semibold leading-5 text-slate-900">
          {item.name}
        </h3>

        {/* CATEGORY */}
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-400">
          {item.category}
        </p>

        {/* DESCRIPTION */}
        <p className="mt-2 min-h-[40px] text-[13px] leading-5 text-blue-600">
          {item.description}
        </p>

        {/* PRICE */}
        <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
          <p className="text-[17px] font-bold text-rose-500">{item.price}</p>

          <span className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-300">
            Đổi nhanh:
          </span>
        </div>

        {/* ACTIONS */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-[16px] bg-slate-100 p-1">
          {/* CÒN MÓN */}
          <button
            className={`h-10 rounded-[14px] text-[12px] font-semibold transition-all ${
              item.status === "available"
                ? statusConfig.available.button
                : "text-slate-600"
            }`}
          >
            CÒN MÓN
          </button>

          {/* SẮP HẾT */}
          <button
            className={`h-10 rounded-[14px] text-[12px] font-semibold transition-all ${
              item.status === "low" ? statusConfig.low.button : "text-slate-600"
            }`}
          >
            SẮP HẾT
          </button>

          {/* HẾT MÓN */}
          <button
            className={`h-10 rounded-[14px] text-[12px] font-semibold transition-all ${
              item.status === "out" ? statusConfig.out.button : "text-slate-600"
            }`}
          >
            HẾT MÓN
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryCard;
