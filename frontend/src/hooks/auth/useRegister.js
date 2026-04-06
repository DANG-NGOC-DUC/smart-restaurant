import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service";

export function useRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e) => {
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
    },
    [errors, error],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!formData.phone) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const response = await register({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email,
          password: formData.password,
        });

        setSuccess(
          response.data?.message ||
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Đăng ký thất bại. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, validateForm, navigate],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    formData,
    errors,
    error,
    success,
    loading,
    handleChange,
    handleSubmit,
    clearError,
  };
}
