//Top 5 món bán chạy
function TopDishCard({ dish }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 hover:shadow-md transition">
      <img
        src={dish.image}
        alt={dish.name}
        className="w-full h-40 object-cover rounded-2xl"
      />

      <h3 className="mt-3 text-center text-slate-800 font-semibold text-sm min-h-[44px]">
        {dish.name}
      </h3>

      <div className="flex justify-center mt-3">
        <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm">
          {dish.quantity}
          <span className="ml-1 text-[11px] font-medium text-slate-500">
            SUẤT
          </span>
        </span>
      </div>
    </div>
  );
}

export default TopDishCard;
