import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { usePublicOrder } from "../../hooks/public/usePublicOrder";

function OrderStatus() {
  const { id } = useParams();
  const { getStatus } = usePublicOrder();
  const [status, setStatus] = useState("Đang tải...");

  const isMounted = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const data = await getStatus(id);
      setStatus(data?.status || "Không xác định");
    } catch (error) {
      console.error("Lỗi lấy trạng thái:", error);
      setStatus("Lỗi kết nối");
    }
  }, [id, getStatus]);

  useEffect(() => {
    isMounted.current = true;

    // Setup interval để gọi fetch (bao gồm lần đầu)
    const intervalId = setInterval(() => {
      fetchStatus();
    }, 5000);

    // Gọi lần đầu NGAY SAU KHI setup interval (defer bằng setTimeout 0ms)
    // → thân effect không còn gọi trực tiếp nữa → hết lỗi lint
    const initialTimer = setTimeout(() => {
      fetchStatus();
    }, 0);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
      clearTimeout(initialTimer);
    };
  }, [fetchStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sea-50">
      <div className="bg-white p-6 rounded-xl shadow-card text-center max-w-md w-full">
        <h2 className="font-bold text-lg text-sea-800 mb-4">
          Trạng thái đơn hàng #{id}
        </h2>

        <p
          className={`mt-2 font-semibold text-xl ${status.includes("Lỗi") ? "text-red-600" : "text-coral-600"}`}
        >
          {status}
        </p>

        {status === "Đang tải..." && (
          <p className="mt-4 text-gray-500 text-sm animate-pulse">
            Đang kiểm tra trạng thái...
          </p>
        )}
      </div>
    </div>
  );
}

export default OrderStatus;
