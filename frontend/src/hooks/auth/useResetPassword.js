import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";

export function useResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Kiểm tra token từ URL hash khi component mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (!token || type !== "recovery") {
      setIsValidToken(false);
      setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    setAccessToken(token);
  }, []);

  // Xử lý thay đổi input
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    if (error) setError(null);
  }, [errors, error]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Xử lý submit form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidToken || !accessToken) {
      setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Sending reset password request with token:", accessToken?.substring(0, 20) + "...");
      await resetPassword(formData.password, accessToken);
      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Đặt lại mật khẩu thất bại. Vui lòng thử lại hoặc yêu cầu link mới.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, accessToken, isValidToken, validateForm, navigate]);

  // Clear error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    formData,
    errors,
    error,
    success,
    loading,
    isValidToken,
    handleChange,
    handleSubmit,
    clearError,
  };
}
