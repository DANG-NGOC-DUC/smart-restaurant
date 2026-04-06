"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getAllReviews } from "../../services/admin.service";

const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? "fill-gold-500 text-gold-500"
              : "fill-none text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAllReviews();
      setReviews(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        ).toFixed(1)
      : "0.0";
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-sea-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-10 h-10 text-crimson-500" />
        <p className="text-crimson-600 font-medium">{error}</p>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-sea-500 text-white rounded-lg hover:bg-sea-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sea-800 font-heading">
            Quản lý Đánh Giá
          </h1>
          <p className="text-sea-500 text-sm mt-1">
            Theo dõi phản hồi từ khách hàng
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 text-sea-600 bg-sea-50 hover:bg-sea-100 rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Average rating */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-gold-600 fill-gold-600" />
            </div>
            <span className="text-sm font-medium text-sea-500">
              Điểm trung bình
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-sea-800">{avgRating}</span>
            <span className="text-sea-400 text-sm mb-1">/ 5</span>
          </div>
          <div className="mt-2">
            <StarRating rating={Math.round(Number(avgRating))} />
          </div>
        </div>

        {/* Total reviews */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sea-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-sea-600" />
            </div>
            <span className="text-sm font-medium text-sea-500">
              Tổng đánh giá
            </span>
          </div>
          <span className="text-3xl font-bold text-sea-800">
            {totalReviews}
          </span>
        </div>

        {/* Rating distribution */}
        <div className="bg-white rounded-xl shadow-card p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-sea-500 mb-3">
            Phân bố đánh giá
          </p>
          <div className="space-y-1.5">
            {ratingDistribution.map(({ star, count }) => {
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right font-medium text-sea-700">
                    {star}
                  </span>
                  <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                  <div className="flex-1 h-2 bg-sea-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sea-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-sea-100">
          <h2 className="font-semibold text-sea-800">
            Tất cả đánh giá ({totalReviews})
          </h2>
        </div>

        {totalReviews === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sea-400">
            <MessageSquare className="w-10 h-10 mb-3" />
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sea-50 text-sea-600 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">
                    Khách hàng
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Đánh giá
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Bình luận
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Đơn hàng
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sea-50">
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-sea-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-sea-800">
                      {review.user_full_name || "Ẩn danh"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            review.rating >= 4
                              ? "bg-green-100 text-green-700"
                              : review.rating === 3
                                ? "bg-gold-100 text-gold-700"
                                : "bg-crimson-100 text-crimson-700"
                          }`}
                        >
                          {review.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <p
                        className={`truncate ${
                          review.rating < 3
                            ? "text-crimson-600 font-medium"
                            : "text-sea-600"
                        }`}
                      >
                        {review.comment || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-sea-500 font-mono text-xs">
                      {review.order_id
                        ? `#${review.order_id.slice(0, 8)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-sea-400 whitespace-nowrap">
                      {formatTimeAgo(review.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
