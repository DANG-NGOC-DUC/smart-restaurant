"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Star, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { getLatestReviews } from "../../services/admin.service";

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

export default function NotificationBell({
  showReviews = true,
  title = "Thông báo mới",
}) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [latestReviews, setLatestReviews] = useState([]);
  const [statusChanges, setStatusChanges] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch 3 latest reviews for the dropdown
  const fetchLatest = async () => {
    if (!showReviews) return;
    try {
      const { data } = await getLatestReviews();
      if (data) setLatestReviews(data);
    } catch {
      // silently fail — bell is non-critical
    }
  };

  useEffect(() => {
    fetchLatest();

    let reviewChannel;
    if (showReviews) {
      reviewChannel = supabase
        .channel("reviews-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "reviews" },
          (payload) => {
            setCount((prev) => prev + 1);
            setLatestReviews((prev) => [payload.new, ...prev].slice(0, 3));
          },
        )
        .subscribe();
    }

    const statusChannel = supabase
      .channel("menu-status-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_requests",
          filter: "request_type=eq.menu_status_change",
        },
        (payload) => {
          setCount((prev) => prev + 1);
          setStatusChanges((prev) => [payload.new, ...prev].slice(0, 3));
        },
      )
      .subscribe();

    return () => {
      if (reviewChannel) supabase.removeChannel(reviewChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [showReviews]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) {
      setCount(0);
      fetchLatest();
    }
  };

  const allNotifications = [
    ...statusChanges.map((s) => ({ ...s, type: "status" })),
    ...latestReviews.map((r) => ({ ...r, type: "review" })),
  ].slice(0, 5); // Show top 5 notifications

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-sea-50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-sea-700" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-crimson-500 rounded-full leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-card-hover border border-sea-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-sea-100 bg-sea-50">
            <h3 className="text-sm font-semibold text-sea-800">{title}</h3>
          </div>

          {allNotifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-sea-400">
              Không có thông báo nào
            </div>
          ) : (
            <ul className="divide-y divide-sea-50 max-h-72 overflow-y-auto">
              {allNotifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-sea-50/50 transition-colors ${
                    notif.type === "status"
                      ? "border-l-2 border-l-amber-500"
                      : notif.rating < 3
                        ? "border-l-2 border-l-crimson-500"
                        : ""
                  }`}
                >
                  {notif.type === "status" ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-sm text-sea-800">
                          Thay đổi trạng thái menu
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 font-medium">
                        {notif.note}
                      </p>
                      <span className="text-[10px] text-sea-400 mt-1 block">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-sea-800">
                          {notif.user_full_name || "Ẩn danh"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i <= notif.rating
                                  ? "fill-gold-500 text-gold-500"
                                  : "fill-none text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 ${
                          notif.rating < 3
                            ? "text-crimson-600 font-medium"
                            : "text-sea-500"
                        }`}
                      >
                        {notif.comment || "Không có bình luận"}
                      </p>
                      <span className="text-[10px] text-sea-400 mt-1 block">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2.5 border-t border-sea-100 bg-sea-50">
            <a
              href="/admin/reviews"
              className="text-xs font-medium text-sea-600 hover:text-sea-800 transition-colors"
            >
              Xem tất cả →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
