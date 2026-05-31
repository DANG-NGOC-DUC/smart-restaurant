import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import { usePublicOrder } from "../../hooks/public/usePublicOrder";
import { publicService } from "../../services/public.service";
import logo from "../../assets/logo.png";

const STATUS_MAP = {
  pending: { label: "Chờ duyệt", color: "bg-yellow-500" },
  preparing: { label: "Đang chế biến", color: "bg-accent" },
  cooked: { label: "Chờ phục vụ", color: "bg-orange-500" },
  served: { label: "Đã phục vụ", color: "bg-primary" },
  cancelled: { label: "Đã hủy", color: "bg-red-500" },
};

function SessionStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasSession, tableName, sessionId } = useSession();
  const { getOrdersBySession } = usePublicOrder();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(location.state?.message || null);

  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const reviewChecked = useRef(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetch = async () => {
      try {
        const orders = await getOrdersBySession(sessionId);
        // Flatten all items from all orders
        const allItems = (orders || []).flatMap((order) =>
          (order.items || []).map((item) => ({
            ...item,
            order_status: order.status,
          })),
        );
        if (!cancelled) setOrderItems(allItems);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    // Poll every 10s
    const interval = setInterval(fetch, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, getOrdersBySession]);

  // Poll session status — detect when cashier closes session
  useEffect(() => {
    if (!sessionId || reviewChecked.current) return;
    let cancelled = false;
    const checkSession = async () => {
      try {
        const res = await publicService.getSessionStatus(sessionId);
        if (!cancelled && res.data.status === "closed") {
          // Check if already reviewed
          const reviewRes = await publicService.getReviewBySession(sessionId);
          if (!cancelled) {
            if (reviewRes.data.reviewed) {
              setAlreadyReviewed(true);
            } else {
              setShowReview(true);
            }
            reviewChecked.current = true;
          }
        }
      } catch {
        // ignore
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId]);

  // Submit review
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
      setToast("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-dvh pb-28">
      {/* Review Modal */}
      {showReview && !alreadyReviewed && (
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

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              arrow_back_ios
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-xl tracking-tight">
              Seafood
            </span>
          </div>
          <div className="bg-primary/10 px-4 py-1.5 rounded-full">
            <span className="text-primary font-bold text-sm">
              {tableName || "Chưa quét QR"}
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 px-2 mt-4">
          TRẠNG THÁI MÓN
        </h1>
      </header>

      {/* Toast notification */}
      {toast && (
        <div className="mx-4 mb-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">
            info
          </span>
          <p className="text-sm font-medium text-primary flex-1">{toast}</p>
          <button onClick={() => setToast(null)} className="text-primary/60">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}

      {/* Order Items */}
      <main className="flex-1 px-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasSession ? (
          <p className="text-center text-slate-400 py-10">
            Chưa quét mã QR bàn.
          </p>
        ) : orderItems.length === 0 ? (
          <p className="text-center text-slate-400 py-10">
            Chưa có món nào được đặt.
          </p>
        ) : null}

        {orderItems.map((item) => {
          const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.pending;
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                {item.image_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${item.image_url}')` }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl">
                      restaurant
                    </span>
                  </div>
                )}
                {/* Quantity badge */}
                {item.quantity > 1 && (
                  <div className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 rounded-lg shadow-md">
                    <span className="text-xs font-bold">x{item.quantity}</span>
                  </div>
                )}
                <div
                  className={`absolute bottom-3 right-3 ${statusInfo.color} px-3 py-1.5 rounded-lg shadow-md`}
                >
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              <div className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {item.menu_item_name || item.name}
                  </h3>
                  {item.variant_label && (
                    <p className="text-primary/70 text-sm mt-0.5 font-medium">
                      {item.variant_label}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-slate-500 text-sm mt-1 italic">
                      📝 {item.note}
                    </p>
                  )}
                </div>
                <span className="text-primary font-bold text-lg shrink-0 ml-3">
                  {Number(item.price).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto p-4 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <button
          onClick={() => navigate("/")}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="tracking-wide">+ GỌI THÊM MÓN</span>
        </button>
      </div>
    </div>
  );
}

export default SessionStatus;
