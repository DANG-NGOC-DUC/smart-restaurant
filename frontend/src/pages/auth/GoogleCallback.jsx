import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { handleGoogleCallback, updateProfile } = useAuth();
  const [error, setError] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    handleGoogleCallback()
      .then(({ user }) => {
        if (cancelled) return;
        // Kiểm tra tên/SĐT: nếu thiếu hoặc tên là mặc định "Khách" → yêu cầu điền
        const missingPhone = !user?.phone;
        const defaultName = !user?.full_name || user.full_name === "Khách";
        if (missingPhone || defaultName) {
          setFullName(defaultName ? "" : user.full_name || "");
          setNeedsProfile(true);
        } else {
          navigate("/menu", { replace: true });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [handleGoogleCallback, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!fullName.trim()) {
      setFormError("Vui lòng nhập tên của bạn.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Vui lòng nhập số điện thoại.");
      return;
    }
    if (!/^[0-9]{9,11}$/.test(phone.trim())) {
      setFormError("Số điện thoại không hợp lệ.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      navigate("/menu", { replace: true });
    } catch (err) {
      setFormError(
        err?.response?.data?.error || "Lưu thất bại. Vui lòng thử lại.",
      );
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-5xl mb-4">
          error
        </span>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          Đăng nhập thất bại
        </h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => navigate("/menu", { replace: true })}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-background-light">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-primary text-3xl">
                person_edit
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Hoàn thiện hồ sơ
            </h2>
            <p className="text-sm text-slate-500 text-center mt-1">
              Vui lòng cung cấp tên và số điện thoại để nhà hàng liên hệ khi
              cần.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                maxLength={100}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                maxLength={11}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-500 text-center">{formError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Lưu và tiếp tục"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Đang đăng nhập...</p>
    </div>
  );
}
