import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/auth";
import Input from "../../components/forms/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function Login() {
  const { formData, loading, error, handleChange, handleSubmit, clearError } =
    useLogin();

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Chào mừng quý khách
        </h2>
        <p className="mt-2 text-gray-600">
          Đăng nhập để tiếp tục sử dụng SeaFood Restaurant
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          required
          icon={
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        <Input
          label="Mật khẩu"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Nhập mật khẩu của bạn"
          required
          icon={
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          Đăng nhập
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
