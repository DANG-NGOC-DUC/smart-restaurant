# Smart Restaurant System

Hệ thống quản lý nhà hàng theo thời gian thực, hỗ trợ 4 nhóm người dùng:

- Admin
- Staff
- Cashier
- Customer

Mục tiêu của dự án là số hóa toàn bộ quy trình tại nhà hàng: quản lý menu, gọi món tại bàn bằng QR, theo dõi trạng thái món, xử lý thanh toán và thống kê vận hành.

## 1. Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + Knex.js
- Database: Supabase (PostgreSQL)
- Authentication:
  - Khách hàng: Supabase Auth (Google OAuth)
  - Nhân sự nội bộ: email + password

## 2. Cấu trúc thư mục

```text
smart-restaurant/
|- backend/                 # API server, migrations, seeders
|- frontend/                # React client
|- API_DOCUMENTATION.md     # Tài liệu API
|- README.md
```

## 3. Yêu cầu môi trường

- Node.js 18+
- npm 9+
- Một project Supabase đang hoạt động

## 4. Cài đặt và chạy dự án

### 4.1 Backend

```bash
cd backend
npm install
npm run dev
```

### 4.2 Frontend

```bash
cd frontend
npm install
npm run dev
```

## 5. Quy ước trạng thái nghiệp vụ

### 5.1 Trạng thái đơn/món

- Đơn:
  - pending: chờ duyệt
  - active: đã duyệt, đang phục vụ
  - completed: đã thanh toán
- Món:
  - pending: chờ duyệt cùng đơn
  - preparing: đang chế biến
  - served: đã lên món
  - cancelled: đã hủy

### 5.2 Trạng thái yêu cầu hỗ trợ

- pending -> acknowledged -> resolved

## 6. Tóm tắt Use Case theo vai trò

Phần này là bản rút gọn để onboarding nhanh. Luồng chi tiết có thể mở rộng theo từng màn hình trong quá trình phát triển.

### 6.1 Admin

1. Dashboard KPI theo ngày, biểu đồ 7 ngày, top món bán chạy, đơn gần đây.
2. Quản lý menu:
   - Danh mục
   - Món ăn (CRUD + hình ảnh + availability)
   - Công thức nguyên liệu
   - Biến thể/size (price multiplier, ingredient multiplier)
3. Quản lý kho:
   - CRUD nguyên liệu
   - Nhập kho/đặt lại tồn kho
4. Quản lý đơn hàng:
   - Đơn hiện tại theo trạng thái
   - Lịch sử đơn có lọc và phân trang
5. Quản lý bàn:
   - CRUD bàn
   - Mở/đóng phiên phục vụ
6. Quản lý người dùng:
   - Tìm kiếm/lọc/pagination
   - CRUD tài khoản và trạng thái
7. Báo cáo doanh thu và hoạt động kinh doanh theo mốc thời gian.
8. Xem đánh giá khách hàng.
9. Cài đặt hệ thống (một số tab mới ở mức giao diện).

### 6.2 Staff

1. Xem sơ đồ bàn realtime.
2. Đặt món hộ khách tại bàn.
3. Duyệt đơn QR từ khách (pending -> active).
4. Theo dõi món đang chế biến, đánh dấu đã phục vụ hoặc hủy món có lý do.
5. Xử lý yêu cầu hỗ trợ từ khách.
6. Gửi yêu cầu thanh toán cho thu ngân.

### 6.3 Cashier

1. Theo dõi toàn bộ bàn và trạng thái bàn.
2. Duyệt đơn từ khách QR.
3. Hủy món trong trường hợp ngoại lệ (chỉ khi preparing).
4. Thanh toán:
   - Kiểm tra điều kiện món đã served/cancelled
   - Tạo invoice
   - Đóng session
5. Xử lý yêu cầu phục vụ từ khách.
6. Xác nhận/từ chối đặt bàn trước.
7. Chốt ca.

### 6.4 Customer

1. Quét QR để bắt đầu phiên gọi món tại bàn.
2. Xem menu ở chế độ preview khi chưa có session.
3. Chọn món, size, ghi chú và thêm vào giỏ.
4. Gửi đơn:
   - Đơn đầu: pending
   - Đơn tiếp theo: active
5. Theo dõi trạng thái món theo thời gian thực.
6. Gửi yêu cầu gọi phục vụ hoặc tính tiền.
7. Đánh giá sau bữa ăn khi session đóng.
8. Đăng nhập Google để dùng tính năng đặt bàn.
9. Đặt bàn trước và quản lý lịch đặt.

## 7. Luồng trạng thái tổng quan

### 7.1 Đơn hàng và món

```text
Khách đặt QR
   |
   v
[pending] --duyet--> [active]
                      |
                      v
                 [preparing] --da len--> [served]
                      |
                      '--huy-------> [cancelled]
```

### 7.2 Yêu cầu hỗ trợ

```text
[pending] --nhan xu ly--> [acknowledged] --hoan tat--> [resolved]
```

## 8. Tài liệu liên quan

- API documentation: API_DOCUMENTATION.md

## 9. Ghi chú phát triển

- Seed dữ liệu mẫu nằm trong backend/seeders.
- Migrations nằm trong backend/migrations.
- Khi thay đổi schema, luôn cập nhật migration và tài liệu API tương ứng.
