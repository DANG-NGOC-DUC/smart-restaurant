import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";

export default function ScanTable() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { scanTable } = useSession();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Mã QR không hợp lệ.");
      return;
    }

    let cancelled = false;
    scanTable(token)
      .then(() => {
        if (!cancelled) navigate("/menu", { replace: true });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              "Không thể quét mã QR. Vui lòng thử lại.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, scanTable, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4">
          error
        </span>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          Không thể kết nối bàn
        </h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-slate-500">Đang kết nối bàn...</p>
    </div>
  );
}
