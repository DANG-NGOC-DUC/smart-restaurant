import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useSession } from "../../context/SessionContext";
import { useAuth } from "../../context/AuthContext";
import { usePublicMenu } from "../../hooks/public/usePublicMenu";
import { publicService } from "../../services/public.service";
import OrderModal from "../../components/public/OrderModal";
import logo from "../../assets/logo2.png";

function Menu() {
  const navigate = useNavigate();
  const { cart, addItem, removeItem } = useCart();
  const { tableName, tableId, sessionId } = useSession();
  const { user } = useAuth();
  const isBrowseMode = !sessionId;
  const { items, categories, loading, error } = usePublicMenu();
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(null);

  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleServiceRequest = async (type) => {
    if (!tableId) return;
    setServiceLoading(type);
    try {
      await publicService.createServiceRequest({
        table_id: tableId,
        session_id: sessionId,
        request_type: type,
      });
      if (type === "call_waiter") {
        alert("Đã gọi phục vụ! Nhân viên sẽ đến ngay.");
      } else if (type === "request_bill") {
        // Show review modal after requesting bill
        if (sessionId) {
          try {
            const res = await publicService.getReviewBySession(sessionId);
            if (!res.data.reviewed) {
              setRating(0);
              setComment("");
              setReviewSubmitted(false);
              setShowReview(true);
            } else {
              alert("Đã yêu cầu tính tiền! Vui lòng chờ.");
            }
          } catch {
            alert("Đã yêu cầu tính tiền! Vui lòng chờ.");
          }
        } else {
          alert("Đã yêu cầu tính tiền! Vui lòng chờ.");
        }
      }
    } catch {
      alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setServiceLoading(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) return;
    setSubmittingReview(true);
    try {
      await publicService.createReview({
        session_id: sessionId,
        rating,
        comment: comment.trim() || null,
      });
      setReviewSubmitted(true);
    } catch {
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter items client-side
  const filteredItems = items.filter((item) => {
    const matchCategory =
      !activeCategory || item.category_id === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
  };

  // Get total quantity of a menu item in cart (sum across all variants)
  const getQty = (id) =>
    cart
      .filter((i) => i.id === id)
      .reduce((sum, i) => sum + (i.quantity || 1), 0);

  // Find the first cart entry for a menu item (to use its cartKey)
  const getCartEntry = (id) => cart.find((i) => i.id === id);

  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalPrice = cart.reduce(
    (sum, i) => sum + Number(i.price || 0) * (i.quantity || 1),
    0,
  );

  return (
    <div className="relative flex flex-col min-h-dvh pb-40">
      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !reviewSubmitted && setShowReview(false)}
          />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up">
            {reviewSubmitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    check_circle
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Cảm ơn bạn!
                </h3>
                <p className="text-slate-500">
                  Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn.
                </p>
                <button
                  onClick={() => setShowReview(false)}
                  className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-xl"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-accent text-3xl">
                      rate_review
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Đánh giá trải nghiệm
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Bạn thấy bữa ăn hôm nay thế nào?
                  </p>
                </div>
                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <span
                        className={`material-symbols-outlined text-4xl ${
                          star <= rating ? "text-yellow-400" : "text-slate-200"
                        }`}
                        style={{
                          fontVariationSettings:
                            star <= rating ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ thêm nhận xét của bạn (không bắt buộc)"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-4"
                  maxLength={500}
                />
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReview(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Bỏ qua
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!rating || submittingReview}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Gửi đánh giá"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Logo"
              className="h-9 w-9 rounded-full object-cover"
            />
            <h1 className="text-primary text-xl font-bold tracking-tight">
              Seafood
            </h1>
          </div>
          <button
            onClick={() => navigate("/account")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          >
            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              <img
                src={
                  user.user_metadata.avatar_url || user.user_metadata.picture
                }
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-primary text-[32px]">
                account_circle
              </span>
            )}
          </button>
        </div>
        {!isBrowseMode && (
          <div className="flex items-center gap-1 px-1 mb-3">
            <span className="material-symbols-outlined text-primary text-sm">
              table_bar
            </span>
            <p className="text-primary text-xs font-bold">
              {tableName || "Chưa quét QR"}
            </p>
          </div>
        )}
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary/60">
              search
            </span>
          </div>
          <input
            className="block w-full pl-10 pr-4 py-3 border-none bg-primary/5 rounded-xl text-slate-900 placeholder-primary/40 focus:ring-2 focus:ring-primary/20 text-sm"
            placeholder="Tìm kiếm món hải sản tươi sống..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Browse Mode Banner */}
      {isBrowseMode && (
        <div className="mx-4 mt-2 mb-1 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0">
            info
          </span>
          <div className="flex-1">
            <p className="text-sm text-slate-700 font-medium">
              Bạn đang xem trước menu.{" "}
              {!user ? (
                <button
                  onClick={() => navigate("/account")}
                  className="text-primary font-bold underline"
                >
                  Đăng nhập
                </button>
              ) : (
                <button
                  onClick={() => navigate("/reservation")}
                  className="text-primary font-bold underline"
                >
                  Đặt bàn trước
                </button>
              )}
              {!user ? " để đặt bàn trước." : " để có chỗ khi đến quán."}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Quét mã QR tại bàn để gọi món
            </p>
          </div>
        </div>
      )}

      {/* Banner Section */}
      {items[0] && (
        <section className="px-4 py-3">
          <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${items[0].image_url}')` }}
            />
            <div className="absolute bottom-3 left-4 z-20">
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Đặc biệt
              </span>
              <h3 className="text-white font-bold text-lg">{items[0].name}</h3>
              <p className="text-white/80 text-xs">
                {Number(items[0].price).toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <nav className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
            !activeCategory
              ? "bg-primary text-white"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
              activeCategory === cat.id
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Product Grid */}
      <main className="grid grid-cols-2 gap-4 p-4">
        {loading ? (
          <div className="col-span-2 flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="col-span-2 text-center py-12 text-sm text-red-500">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-sm text-slate-400">
            Không tìm thấy món ăn
          </div>
        ) : (
          filteredItems.map((item) => {
            const qty = getQty(item.id);
            const isSelected = qty > 0;
            const isOutOfStock = item.is_in_stock === false;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col ${
                  isOutOfStock
                    ? "border border-slate-100 opacity-80"
                    : isSelected
                      ? "border-2 border-accent/30 relative"
                      : "border border-slate-100"
                }`}
              >
                {isSelected && !isOutOfStock && (
                  <div className="absolute top-2 right-2 z-10 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                    {qty}
                  </div>
                )}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {item.image_url && (
                    <div
                      className="absolute inset-0 bg-center bg-cover"
                      style={{ backgroundImage: `url('${item.image_url}')` }}
                    />
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full tracking-wide">
                        Hết món
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="text-slate-900 font-semibold text-sm line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-accent font-bold text-sm mt-1">
                    {(() => {
                      const vs = item.variants || [];
                      if (vs.length === 0)
                        return `${Number(item.price).toLocaleString("vi-VN")} đ`;
                      const def = vs.find((v) => v.is_default) || vs[0];
                      const baseP =
                        Number(item.price) + Number(def.price_extra || 0);
                      const prices = vs.map(
                        (v) => Number(item.price) + Number(v.price_extra || 0),
                      );
                      const minP = Math.min(...prices);
                      const maxP = Math.max(...prices);
                      return minP === maxP
                        ? `${baseP.toLocaleString("vi-VN")} đ`
                        : `${minP.toLocaleString("vi-VN")} - ${maxP.toLocaleString("vi-VN")} đ`;
                    })()}
                  </p>
                  {isBrowseMode ? (
                    <button
                      onClick={() => setModalItem(item)}
                      className="mt-3 w-full py-2 text-primary/70 rounded-lg flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors bg-primary/5"
                    >
                      <span className="material-symbols-outlined text-sm">
                        visibility
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Xem
                      </span>
                    </button>
                  ) : isOutOfStock ? (
                    <button
                      disabled
                      className="mt-3 w-full py-2 text-slate-400 rounded-lg flex items-center justify-center gap-1 bg-slate-100 cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">
                        block
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Hết món
                      </span>
                    </button>
                  ) : isSelected ? (
                    <div className="mt-3 flex items-center justify-between bg-accent rounded-lg p-0.5">
                      <button
                        onClick={() => {
                          const entry = getCartEntry(item.id);
                          if (entry) removeItem(entry.cartKey || entry.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-l-md"
                      >
                        <span className="material-symbols-outlined text-base">
                          remove
                        </span>
                      </button>
                      <span className="text-white text-sm font-bold">
                        {qty}
                      </span>
                      <button
                        onClick={() => {
                          const entry = getCartEntry(item.id);
                          addItem(entry || item);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-r-md"
                      >
                        <span className="material-symbols-outlined text-base">
                          add
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setModalItem(item)}
                      className="mt-3 w-full py-2 text-accent rounded-lg flex items-center justify-center gap-1 hover:bg-accent/20 transition-colors bg-accent/20"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Thêm
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Bottom Bar */}
      {isBrowseMode ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-background-light/80 backdrop-blur-md pt-3 px-4 pb-6">
          <div className="flex gap-3">
            <button
              onClick={() => navigate(user ? "/reservation" : "/account")}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">
                calendar_month
              </span>
              <span className="text-xs uppercase tracking-wider">
                {user ? "Đặt bàn" : "Đăng nhập"}
              </span>
            </button>
            {user && (
              <button
                onClick={() => navigate("/my-reservations")}
                className="bg-white border-2 border-primary text-primary font-bold py-3.5 px-5 rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">
                  list_alt
                </span>
                <span className="text-xs uppercase tracking-wider">
                  Lịch đặt
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-background-light/80 backdrop-blur-md pt-3 px-4 pb-6">
          {/* Quick Actions + Cart in one block */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => handleServiceRequest("call_waiter")}
              disabled={serviceLoading === "call_waiter" || !tableId}
              className="flex-1 bg-white rounded-xl flex flex-col items-center justify-center text-primary active:scale-95 transition-transform border-2 border-primary shadow-sm h-[52px] disabled:opacity-50"
            >
              {serviceLoading === "call_waiter" ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-xl">
                  notifications_active
                </span>
              )}
              <span className="text-[10px] font-bold uppercase mt-0.5">
                Phục vụ
              </span>
            </button>
            <button
              onClick={() => navigate("/order-status")}
              className="flex-1 bg-white rounded-xl flex flex-col items-center justify-center text-primary active:scale-95 transition-transform border-2 border-primary shadow-sm h-[52px]"
            >
              <span className="material-symbols-outlined text-xl">
                list_alt
              </span>
              <span className="text-[10px] font-bold uppercase mt-0.5">
                Trạng thái
              </span>
            </button>
            <button
              onClick={() => handleServiceRequest("request_bill")}
              disabled={serviceLoading === "request_bill" || !tableId}
              className="flex-1 bg-white rounded-xl flex flex-col items-center justify-center text-primary active:scale-95 transition-transform border-2 border-primary shadow-sm h-[52px] disabled:opacity-50"
            >
              {serviceLoading === "request_bill" ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-xl">
                  receipt_long
                </span>
              )}
              <span className="text-[10px] font-bold uppercase mt-0.5">
                Tính tiền
              </span>
            </button>
          </div>

          {/* Cart Bar */}
          <div className="bg-primary rounded-2xl shadow-2xl p-3 flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative bg-white/20 p-2 rounded-xl">
                <span className="material-symbols-outlined text-white">
                  shopping_basket
                </span>
                {totalItems > 0 && (
                  <div className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-primary">
                    {totalItems}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
                  Tổng tiền
                </p>
                <p className="text-white font-bold text-sm">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="bg-accent hover:bg-[#ff8f66] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Xem giỏ hàng
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {modalItem && (
        <OrderModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          readOnly={isBrowseMode}
          onAddToCart={(itemWithOptions) => {
            addItem(itemWithOptions);
          }}
        />
      )}
    </div>
  );
}

export default Menu;
