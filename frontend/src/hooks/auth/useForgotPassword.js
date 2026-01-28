import { useState, useCallback } from "react";
import { forgotPassword } from "../../services/auth.service";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setEmail(e.target.value);
    if (error) setError(null);
    if (message) setMessage(null);
  }, [error, message]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Vui lòng nhập email của bạn.");
      setLoading(false);
      return;
    }

    try {
      await forgotPassword(email);
      setMessage(
        "Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn."
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  }, [email]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    email,
    message,
    error,
    loading,
    handleChange,
    handleSubmit,
    clearError,
    clearMessage,
  };
}
