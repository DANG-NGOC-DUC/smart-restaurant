//Top 5 món bán chạy
function TopDishCard({ dish }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:shadow-md transition">
      <img
        src={dish.image}
        alt={dish.name}
        className="w-full h-52 object-cover rounded-2xl"
      />

      <h3 className="mt-4 text-center text-slate-800 font-semibold text-base min-h-[48px]">
        {dish.name}
      </h3>

      <div className="flex justify-center mt-4">
        <span className="px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold">
          {dish.quantity}
          <span className="ml-1 text-xs font-medium text-slate-500">SUẤT</span>
        </span>
      </div>
    </div>
  );
}

export default TopDishCard;
