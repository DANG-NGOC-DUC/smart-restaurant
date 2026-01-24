# Tài liệu API - Hệ thống Smart Restaurant

Đây là tài liệu mô tả các API của dự án.

## Authentication

Tiền tố chung: `/api/auth`

---

### 1. Đăng ký tài khoản

Đăng ký một tài khoản người dùng mới. Mặc định, tài khoản mới sẽ có vai trò là `guest`.

- **Phương thức:** `POST`
- **Endpoint:** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "your-strong-password"
  }
  ```
- **Phản hồi thành công (201 Created):**
  ```json
  {
    "message": "Sign up successful. Please check your email for verification.",
    "user": {
      "id": "...",
      "email": "user@example.com",
      // ... các thông tin khác từ Supabase
    }
  }
  ```

---

### 2. Đăng nhập

Đăng nhập để nhận về `access_token` (JWT) và thông tin phiên làm việc.

- **Phương thức:** `POST`
- **Endpoint:** `/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "your-strong-password"
  }
  ```
- **Phản hồi thành công (200 OK):**
  ```json
  {
    "access_token": "your-jwt-token",
    "token_type": "bearer",
    "expires_in": 3600,
    // ... các thông tin khác
    "user": {
        "id": "...",
        "email": "user@example.com",
        "role": "guest"
    }
  }
  ```

---

## Admin

Tiền tố chung: `/api/admin`

Các API trong mục này yêu cầu quyền `admin`. Người dùng phải đính kèm `access_token` nhận được khi đăng nhập vào Header `Authorization`.

---

### 1. Cập nhật vai trò người dùng

Cho phép admin thay đổi vai trò (role) của một người dùng bất kỳ.

- **Phương thức:** `PUT`
- **Endpoint:** `/api/admin/users/:userId/role`
  - `:userId`: ID của người dùng cần được cập nhật.
- **Headers:**
  - `Authorization`: `Bearer <YOUR_ADMIN_ACCESS_TOKEN>`
- **Body (JSON):**
  - Các vai trò hợp lệ: `guest`, `staff`, `cashier`, `admin`.
  ```json
  {
    "role": "staff"
  }
  ```
- **Phản hồi thành công (200 OK):**
  ```json
  {
    "id": "user-id-that-was-updated",
    "email": "user@example.com",
    "role": "staff"
  }
  ```
