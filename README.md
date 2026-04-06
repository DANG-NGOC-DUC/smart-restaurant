# Smart Restaurant System

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express + Knex.js
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (Google OAuth cho khách, email+password cho nhân viên)

## Project Structure

- backend/: API server
- frontend/: React client

## How to run

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Use Case — Admin

### UC-01: Xem Dashboard

- **Actor:** Admin
- **Mô tả:** Admin xem tổng quan hoạt động nhà hàng trong ngày
- **Luồng chính:**
  1. Admin đăng nhập và truy cập trang Dashboard
  2. Hệ thống hiển thị các KPI: doanh thu, số đơn, số khách, số món đã bán (kèm % thay đổi so với hôm qua)
  3. Biểu đồ doanh thu 7 ngày gần nhất
  4. Top 5 món bán chạy
  5. Danh sách đơn hàng gần đây
- **Tự động:** Dashboard auto-refresh mỗi 60 giây

### UC-02: Quản lý Thực đơn (Menu)

- **Actor:** Admin
- **Mô tả:** Admin quản lý danh mục và các món ăn trên thực đơn

#### UC-02a: Quản lý Danh mục

- **Luồng chính:**
  1. Admin mở trang Menu → chọn "Quản lý danh mục"
  2. Hệ thống hiển thị danh sách danh mục
  3. Admin có thể: tạo mới / sửa tên / xóa danh mục

#### UC-02b: CRUD Món ăn

- **Luồng chính:**
  1. Admin xem danh sách món dạng card grid (có tìm kiếm + lọc theo danh mục)
  2. Thêm món mới: nhập tên, giá, danh mục, mô tả, upload hình ảnh
  3. Sửa món: chỉnh sửa thông tin, thay đổi hình ảnh
  4. Xóa món: xác nhận trước khi xóa
  5. Bật/tắt trạng thái còn món (is_available)

#### UC-02c: Quản lý Công thức (Recipe)

- **Luồng chính:**
  1. Admin chọn món ăn → xem công thức
  2. Gán nguyên liệu + số lượng cần dùng cho mỗi món
  3. Sửa số lượng nguyên liệu / xóa nguyên liệu khỏi công thức

#### UC-02d: Quản lý Biến thể (Variant/Size)

- **Luồng chính:**
  1. Admin chọn món ăn → quản lý biến thể (size)
  2. Thêm biến thể: tên (S/M/L), hệ số giá (price_multiplier), hệ số nguyên liệu (ingredient_multiplier)
  3. Sửa / xóa biến thể

### UC-03: Quản lý Nguyên liệu & Tồn kho

- **Actor:** Admin

#### UC-03a: CRUD Nguyên liệu

- **Luồng chính:**
  1. Admin xem danh sách nguyên liệu (tên, đơn vị, tồn kho, mức tối thiểu, trạng thái)
  2. Lọc theo tab: Tất cả / Sắp hết / Hết hàng / Chưa nhập kho
  3. Tìm kiếm theo tên, lọc theo đơn vị
  4. Thêm / sửa / xóa nguyên liệu
  5. Xem các món sử dụng nguyên liệu này

#### UC-03b: Quản lý Tồn kho

- **Luồng chính:**
  1. Admin nhập thêm hàng (add stock) cho nguyên liệu
  2. Hoặc đặt lại số lượng tồn kho (set stock)
  3. Hệ thống hiển thị thanh trạng thái tồn kho (xanh=đủ, vàng=sắp hết, đỏ=hết)

### UC-04: Quản lý Đơn hàng

- **Actor:** Admin
- **Mô tả:** Admin theo dõi và quản lý tất cả đơn hàng

#### UC-04a: Đơn hàng hiện tại

- **Luồng chính:**
  1. Admin xem danh sách đơn hiện tại, nhóm theo bàn
  2. Lọc theo trạng thái: Chờ duyệt / Đang làm / Hoàn thành / Đã hủy
  3. Xem thống kê số đơn theo từng trạng thái
  4. Thay đổi trạng thái đơn hàng
  5. Hủy đơn (có xác nhận)

#### UC-04b: Lịch sử đơn hàng

- **Luồng chính:**
  1. Admin xem lịch sử tất cả đơn hàng
  2. Lọc theo: trạng thái, khoảng ngày, tìm kiếm
  3. Phân trang kết quả

### UC-05: Quản lý Bàn

- **Actor:** Admin
- **Mô tả:** Admin quản lý bàn ăn và phiên phục vụ

#### UC-05a: CRUD Bàn

- **Luồng chính:**
  1. Admin xem grid bàn với trạng thái (Trống/Đang dùng/Tắt)
  2. Xem thống kê: tổng bàn, bàn trống, bàn đang dùng
  3. Thêm bàn mới: tên, mã, sức chứa
  4. Sửa / xóa bàn (không xóa được nếu đang có khách)
  5. Mỗi bàn tự động có mã QR

#### UC-05b: Quản lý Phiên (Session)

- **Luồng chính:**
  1. Admin mở phiên cho bàn (open session)
  2. Đóng phiên (close session) — cảnh báo nếu còn món chưa phục vụ
  3. Xem thông tin phiên đang hoạt động

### UC-06: Quản lý Người dùng

- **Actor:** Admin
- **Mô tả:** Admin quản lý tài khoản nhân viên và khách hàng
- **Luồng chính:**
  1. Xem danh sách người dùng dạng bảng (có phân trang, 20/trang)
  2. Tìm kiếm theo tên/email/SĐT/mã nhân viên
  3. Lọc theo vai trò: Guest / Staff / Cashier / Admin
  4. Tạo tài khoản mới: email, họ tên, SĐT, vai trò, trạng thái, mã nhân viên
  5. Sửa thông tin người dùng
  6. Xóa người dùng (đồng bộ với Supabase)
  7. Thay đổi trạng thái: Active / Inactive / Blocked

### UC-07: Xem Báo cáo & Thống kê

- **Actor:** Admin
- **Mô tả:** Admin xem các báo cáo doanh thu và hoạt động kinh doanh
- **Luồng chính:**
  1. Chọn khoảng thời gian: Hôm nay / 7 ngày / 30 ngày / Tháng này / Quý này
  2. Xem KPI: tổng doanh thu, tổng đơn, giá trị trung bình/đơn, tổng khách (kèm % thay đổi)
  3. Tab Tổng quan: biểu đồ doanh thu theo ngày + top món bán chạy + doanh thu theo danh mục
  4. Tab Giờ cao điểm: biểu đồ cột phân tích giờ đông khách
  5. Tab Phương thức thanh toán: biểu đồ tròn tỷ lệ thanh toán

### UC-08: Xem Đánh giá

- **Actor:** Admin
- **Mô tả:** Admin xem tất cả đánh giá từ khách hàng
- **Luồng chính:**
  1. Xem điểm đánh giá trung bình và tổng số lượt đánh giá
  2. Xem phân bố rating (5⭐ → 1⭐) dạng thanh ngang
  3. Duyệt danh sách đánh giá: tên khách, số sao, nội dung, thời gian
  4. Làm mới dữ liệu

### UC-09: Cài đặt hệ thống

- **Actor:** Admin
- **Mô tả:** Admin cấu hình thông tin nhà hàng
- **Trạng thái:** ⚠️ Chỉ có giao diện, chưa có backend lưu trữ
- **Tab đã có giao diện:**
  - Chung: tên nhà hàng, email, SĐT, địa chỉ, giờ mở/đóng cửa, thuế, phụ thu
  - Thông báo / Bảo mật / Giao diện / Thanh toán: chưa triển khai

---

## Use Case — Nhân viên (Staff)

### UC-10: Quản lý Sơ đồ bàn

- **Actor:** Staff
- **Mô tả:** Nhân viên xem trạng thái tất cả bàn trong nhà hàng, theo dõi realtime

#### UC-10a: Xem sơ đồ bàn

- **Luồng chính:**
  1. NV đăng nhập → vào trang `/staff` (TableMap)
  2. Hệ thống hiển thị tất cả bàn dạng card:
     - Bàn trống: viền xám, hiện sức chứa, nút "Đặt món"
     - Bàn đang dùng: viền coral, hiện thời gian bắt đầu + tổng tiền, nút "Đặt món" + "Thanh toán"
  3. Dữ liệu cập nhật realtime qua Supabase subscription (sessions, orders, order_items)

#### UC-10b: Lọc bàn theo trạng thái

- **Luồng chính:**
  1. NV bấm tab filter: Tất cả / Đang dùng / Trống
  2. Danh sách bàn cập nhật theo bộ lọc (client-side)
  3. Mỗi tab hiện số lượng bàn tương ứng

#### UC-10c: Xem chi tiết bàn

- **Luồng chính:**
  1. NV bấm vào bàn đang dùng → chuyển đến `/staff/table/:tableId`
  2. Hiển thị: tên bàn, thời gian session, tổng tiền
  3. Summary card: tổng bill, số món, badge (đang nấu / đã lên / đã hủy)
  4. Danh sách order (expandable): trạng thái từng order, từng item (tên, giá, số lượng, trạng thái)
  5. Cancelled items hiện gạch ngang + lý do hủy
- **Action bar (bottom):**
  - "Đặt thêm món" → chuyển đến StaffOrderPage
  - "Thanh toán" → tạo yêu cầu thanh toán gửi thu ngân

### UC-11: Đặt món hộ khách

- **Actor:** Staff
- **Mô tả:** NV đặt món trực tiếp cho khách (bàn trống hoặc đang dùng)

#### UC-11a: Xem thực đơn & tìm kiếm

- **Luồng chính:**
  1. NV bấm "Đặt món" trên bàn → chuyển đến `/staff/order/:tableId`
  2. Giao diện 2 cột: menu bên trái (60%), giỏ hàng bên phải (40%)
  3. Menu panel: thanh tìm kiếm + tab danh mục + grid món (ảnh, tên, giá)
  4. Tìm kiếm real-time theo tên (case-insensitive)
  5. Nếu bàn đã có order → hiện banner amber "Món đã đặt" (expandable)

#### UC-11b: Quản lý giỏ hàng

- **Luồng chính:**
  1. Bấm "+" trên món → thêm vào giỏ (quantity = 1). Đã có → tăng quantity
  2. Giỏ hàng hiện: tên món, giá, nút ±, nút xóa
  3. Toggle ghi chú per-item (expandable input)
  4. Subtotal mỗi món = giá × số lượng
  5. Footer: tổng tiền + nút "Xóa tất cả" + nút "Gửi bếp · {tên bàn}"
- **Luồng thay thế:**
  - Quantity giảm về 0 → tự xóa khỏi giỏ
  - Giỏ rỗng → nút gửi bị disable, hiện empty state

#### UC-11c: Gửi order

- **Luồng chính:**
  1. NV bấm "Gửi bếp"
  2. Backend (trong transaction):
     a. Lock bàn (FOR UPDATE) → tránh race condition
     b. Validate: bàn tồn tại, is_active, items hợp lệ
     c. Bàn trống → tạo session mới. Bàn có khách → dùng session hiện tại
     d. Tạo order (status = `active`) + bulk insert items (status = `preparing`)
     e. Trừ tồn kho nguyên liệu
  3. Thành công: toast xanh "Đã gửi order thành công!", tự chuyển về sơ đồ bàn sau 1.5s
- **Luồng thay thế:**
  - Hết nguyên liệu → rollback toàn bộ, toast đỏ hiện lỗi
  - Món không còn phục vụ → rollback, hiện tên món bị lỗi
  - Bàn đang chờ dọn → báo lỗi "Bàn chờ dọn"

### UC-12: Duyệt đơn QR từ khách

- **Actor:** Staff
- **Mô tả:** Khách quét QR đặt món → đơn ở trạng thái `pending` → NV duyệt hoặc từ chối

#### UC-12a: Xem danh sách đơn chờ duyệt

- **Luồng chính:**
  1. NV vào tab "Đơn chờ" `/staff/pending`
  2. Hiển thị danh sách đơn hàng pending: tên bàn, danh sách món (tên + SL + ghi chú), tổng tiền, thời gian đặt
  3. Realtime: Supabase subscription trên bảng `orders` + `order_items`
  4. Badge count hiện trên bottom nav (tối đa 99+)
- **Empty state:** "Không có đơn hàng nào chờ duyệt"

#### UC-12b: Duyệt đơn hàng

- **Luồng chính:**
  1. NV bấm "Xác nhận đơn" trên đơn pending
  2. Backend (trong transaction):
     a. Order: `pending` → `active`
     b. Items: `pending` → `preparing` (bếp bắt đầu nấu)
     c. Trừ tồn kho nguyên liệu
  3. Đơn biến mất khỏi danh sách (optimistic update)
  4. Badge count giảm
- **Luồng thay thế:**
  - Đơn đã được NV khác duyệt → báo lỗi "Đơn hàng đã được duyệt rồi"
  - Hết nguyên liệu khi duyệt → rollback, hiện lỗi

### UC-13: Phục vụ món ăn

- **Actor:** Staff
- **Mô tả:** NV theo dõi món đang nấu và đánh dấu đã phục vụ hoặc hủy

#### UC-13a: Xem danh sách món chờ phục vụ

- **Luồng chính:**
  1. NV vào tab "Lên món" `/staff/serve`
  2. Hiển thị items có status = `preparing`, nhóm theo bàn
  3. Mỗi item: tên món, ảnh, số lượng, ghi chú, thời gian chờ (phút)
  4. Sắp xếp: món cũ nhất lên đầu
  5. Realtime: subscription trên `order_items`

#### UC-13b: Đánh dấu đã lên món

- **Luồng chính:**
  1. NV bấm "Đã lên" trên item
  2. Backend: atomic update `preparing` → `served` (WHERE id AND status = 'preparing')
  3. Item biến mất khỏi danh sách (optimistic)
- **Luồng thay thế:**
  - NV khác đã thao tác → "Món đã được cập nhật bởi người khác"

#### UC-13c: Hủy món

- **Luồng chính:**
  1. NV bấm "Hủy" trên item
  2. Modal hiện ra: 5 lý do mặc định + ô nhập lý do tùy chỉnh
     - Khách đổi ý
     - Món gặp vấn đề
     - Hết nguyên liệu
     - Đặt nhầm
     - Chờ quá lâu
  3. NV chọn lý do (bắt buộc) → bấm "Xác nhận hủy"
  4. Backend: atomic update `preparing` → `cancelled`, ghi nhận: cancel_reason, cancelled_by (staff_id), cancelled_at
  5. Item biến mất khỏi danh sách
- **Lưu ý:** Chỉ hủy được món đang ở trạng thái `preparing`

### UC-14: Xử lý yêu cầu hỗ trợ

- **Actor:** Staff
- **Mô tả:** Khách gửi yêu cầu qua app (gọi NV, cần hỗ trợ, tính tiền) → NV nhận + xử lý

#### UC-14a: Xem danh sách yêu cầu

- **Luồng chính:**
  1. NV vào tab "Thông báo" `/staff/alerts`
  2. Hiển thị yêu cầu theo loại + icon:
     - 🖐️ Gọi nhân viên (coral)
     - ❓ Cần hỗ trợ (blue)
     - 🧾 Tính tiền (amber)
  3. Mỗi yêu cầu: icon loại, tên bàn, thời gian chờ (phút), ghi chú, nhãn "MỚI"
  4. Pending hiện nút "Nhận xử lý", Acknowledged hiện nút "Hoàn tất"
  5. Realtime: subscription trên `service_requests`

#### UC-14b: Nhận xử lý yêu cầu

- **Luồng chính:**
  1. NV bấm "Nhận xử lý"
  2. Backend: atomic update `pending` → `acknowledged`, gắn staff_id + acknowledged_at
  3. Yêu cầu chuyển sang trạng thái "đang xử lý"
- **Luồng thay thế:**
  - NV khác đã nhận → "Yêu cầu này đã có nhân viên khác đang xử lý"
  - Đã giải quyết rồi → "Yêu cầu này đã được giải quyết"

#### UC-14c: Hoàn tất yêu cầu

- **Luồng chính:**
  1. NV bấm "Hoàn tất" (chỉ hiện nếu đã acknowledge)
  2. Backend: atomic update `acknowledged` → `resolved`, ghi resolved_at
  3. Yêu cầu biến mất khỏi danh sách
- **Ràng buộc:** Chỉ NV đã nhận xử lý mới được hoàn tất (staff_id phải khớp)
- **Luồng thay thế:**
  - Không phải người nhận → "Bạn không phải người nhận xử lý yêu cầu này"

#### UC-14d: Gửi yêu cầu thanh toán

- **Luồng chính:**
  1. NV bấm "Thanh toán" từ sơ đồ bàn hoặc chi tiết bàn
  2. Backend: tạo service_request (type = `request_bill`, status = `pending`)
  3. Thu ngân nhận thông báo qua Supabase realtime
- **Ràng buộc:** Bàn phải có session đang mở, không có yêu cầu thanh toán trùng

### Sơ đồ trạng thái — Đơn hàng & Món

```
          ┌─────── Khách đặt qua QR ───────┐
          │                                  │
          ▼                                  │
      [pending] ──── UC-12b Duyệt ────► [active]
                                             │
                                     (items được tạo)
                                             │
                                             ▼
                                     [preparing] ◄── UC-11c NV đặt hộ
                                       │       │
                              UC-13b   │       │   UC-13c
                             Đã lên    │       │   Hủy món
                                       ▼       ▼
                                   [served] [cancelled]
```

### Sơ đồ trạng thái — Yêu cầu hỗ trợ

```
  [pending] ──── UC-14b Nhận xử lý ────► [acknowledged] ──── UC-14c Hoàn tất ────► [resolved]
```

---

## Use Case — Thu ngân (Cashier)

### UC-10: Xem & Quản lý bàn

- **Actor:** Thu ngân
- **Mô tả:** Thu ngân theo dõi trạng thái tất cả các bàn theo thời gian thực
- **Luồng chính:**
  1. Thu ngân đăng nhập → giao diện CashierPage hiển thị grid bàn (bên trái 65%)
  2. Mỗi bàn hiển thị: mã bàn, tên, sức chứa, trạng thái, số món, tổng tiền
  3. Trạng thái bàn tự động xác định:
     - **Đang rảnh** (xanh): chưa có phiên phục vụ
     - **Đang phục vụ** (xanh biển): có phiên, chưa yêu cầu thanh toán
     - **Chờ thanh toán** (vàng): khách đã yêu cầu tính tiền
     - **Chờ duyệt** (cam): có đơn mới từ khách QR chưa xác nhận
  4. Lọc bàn theo trạng thái bằng thanh bộ lọc (5 nút, mỗi nút hiện số lượng)
  5. Click vào bàn → panel bên phải hiển thị chi tiết đơn hàng
- **Tự động:** Danh sách bàn tự refresh mỗi 10 giây

### UC-11: Duyệt đơn hàng từ khách QR

- **Actor:** Thu ngân
- **Mô tả:** Khi khách quét QR gọi món, thu ngân xác nhận đơn trước khi gửi bếp
- **Luồng chính:**
  1. Khách QR đặt món → đơn hàng trạng thái "pending" → bàn hiện badge cam nhấp nháy
  2. Thu ngân click vào bàn → panel phải hiện khung cam "Đơn chờ duyệt"
  3. Hiển thị danh sách món trong đơn chờ (tên, size, số lượng, ghi chú, giá)
  4. Thu ngân nhấn **"Xác nhận đơn — Gửi bếp"**
  5. Hệ thống: chuyển đơn thành "active", các món thành "preparing", trừ kho nguyên liệu
  6. Toast thành công, món chuyển vào danh sách đang chế biến
- **Lưu ý:** Kho nguyên liệu bị trừ ngay khi duyệt đơn (không phải lúc thanh toán)

### UC-12: Hủy món (xử lý ngoại lệ)

- **Actor:** Thu ngân
- **Mô tả:** Thu ngân hủy món đang chế biến khi có sự cố
- **Điều kiện:** Chỉ hủy được món ở trạng thái "preparing" (đang chế biến)
- **Luồng chính:**
  1. Thu ngân nhấn nút "X" trên món đang chế biến
  2. Hộp thoại xác nhận hiện lên
  3. Thu ngân xác nhận → món chuyển sang "cancelled" (gạch ngang, màu đỏ)
- **Ràng buộc:** Không hủy được món đã phục vụ (served) hoặc đã hủy

### UC-13: Thanh toán

- **Actor:** Thu ngân
- **Mô tả:** Thu ngân xử lý thanh toán khi khách muốn tính tiền
- **Điều kiện tiên quyết:** Tất cả món phải ở trạng thái "served" hoặc "cancelled" (không còn món đang chế biến)
- **Luồng chính:**
  1. Panel đơn hàng hiển thị tóm tắt: tạm tính, VAT 10%, giảm giá, **tổng phải thu**
  2. Thu ngân nhấn **"Thanh toán"** → mở modal thanh toán
  3. Modal hiển thị: tên bàn, tổng tiền, 4 phương thức thanh toán
  4. Chọn phương thức: Tiền mặt / Chuyển khoản / MoMo / Bank
  5. Nhấn **"Xác nhận thanh toán"**
  6. Hệ thống:
     - Tính tổng từ các món "served" (bỏ qua món đã hủy)
     - Tạo hóa đơn (invoice) với phương thức thanh toán
     - Chuyển đơn hàng thành "completed"
     - Đóng phiên (session closed)
     - Bàn tự động chuyển về "rảnh"
  7. Toast thành công với số tiền, panel reset
- **Nút phụ:** "In tạm tính" — in phiếu tạm cho khách xem trước khi thanh toán

### UC-14: Xử lý yêu cầu phục vụ

- **Actor:** Thu ngân
- **Mô tả:** Thu ngân tiếp nhận và xử lý yêu cầu từ khách hàng qua app
- **Luồng chính:**
  1. Khách nhấn nút gọi phục vụ trong app → yêu cầu hiện ở panel "Yêu cầu phục vụ"
  2. Mỗi yêu cầu hiển thị: loại yêu cầu (icon + màu), tên bàn, thời gian
  3. Các loại yêu cầu:
     - 🔵 **Gọi phục vụ** (call_waiter): khách cần nhân viên đến bàn
     - 🟡 **Tính tiền** (request_bill): khách muốn thanh toán → bàn chuyển sang "chờ thanh toán"
     - 🔵 **Thêm đá** (add_ice): yêu cầu phụ
  4. Thu ngân nhấn nút ✓ → đánh dấu đã xử lý, xóa khỏi panel
- **Badge:** Header hiển thị số yêu cầu chưa xử lý (badge vàng)
- **Tự động:** Refresh mỗi 10 giây

### UC-15: Quản lý đặt bàn trước

- **Actor:** Thu ngân
- **Mô tả:** Thu ngân xác nhận hoặc từ chối đặt bàn trước của khách

#### UC-15a: Xác nhận đặt bàn

- **Luồng chính:**
  1. Khách đặt bàn qua app → reservation trạng thái "pending"
  2. Panel "Đặt bàn" hiển thị: tên khách, ngày giờ, số khách, ghi chú
  3. Hiển thị trạng thái thời gian: "X phút nữa" hoặc "Quá giờ"
  4. Thu ngân chọn bàn trống từ dropdown (tùy chọn)
  5. Nhấn **"Xác nhận"** → chuyển thành "confirmed", gán bàn nếu có
- **Badge:** Header hiển thị số đặt bàn chờ xác nhận (badge cam)
- **Tự động:** Refresh mỗi 15 giây

#### UC-15b: Từ chối đặt bàn

- **Luồng chính:**
  1. Thu ngân xem đặt bàn không thể phục vụ
  2. Nhấn **"Từ chối"** → reservation chuyển thành "cancelled"
  3. Xóa khỏi panel

### UC-16: Chốt ca

- **Actor:** Thu ngân
- **Mô tả:** Thu ngân kết thúc ca làm việc
- **Luồng chính:**
  1. Thu ngân nhấn nút **"Chốt ca"** ở header
  2. Hệ thống đăng xuất, chuyển về trang đăng nhập

---

## Use Case — Thực khách (Customer)

### UC-17: Quét mã QR và bắt đầu phiên

- **Actor:** Thực khách
- **Mô tả:** Thực khách quét mã QR trên bàn để bắt đầu gọi món
- **Luồng chính:**
  1. Thực khách quét mã QR trên bàn → truy cập link `/table/:token`
  2. Hệ thống xác thực mã QR, tìm/tạo phiên phục vụ (session)
  3. Lưu thông tin bàn + session vào sessionStorage (mất khi đóng tab)
  4. Chuyển hướng đến trang Menu ở **chế độ gọi món**
- **Luồng ngoại lệ:** Mã QR không hợp lệ → hiển thị lỗi, nút quay về trang chủ

### UC-18: Xem thực đơn (Chế độ xem trước)

- **Actor:** Thực khách (chưa quét QR)
- **Mô tả:** Thực khách truy cập trực tiếp qua link để xem menu trước
- **Luồng chính:**
  1. Truy cập `/menu` trực tiếp (không qua QR)
  2. Hệ thống nhận diện **chế độ xem trước** (browse mode) — không có sessionId
  3. Hiển thị banner: "Bạn đang xem trước menu"
  4. Các món hiển thị nút **"Xem"** thay vì "Thêm"
  5. Mở modal chi tiết món (hình ảnh, giá, size) nhưng **không thể thêm vào giỏ**
  6. Modal hiện thông báo: "Quét mã QR tại bàn để gọi món"
  7. Thanh dưới hiển thị nút **"Đặt bàn"** và **"Lịch đặt"** (nếu đã đăng nhập) hoặc **"Đăng nhập"**
- **Khác biệt với chế độ gọi món:**

|               | Xem trước (Browse)      | Gọi món (Dining)              |
| ------------- | ----------------------- | ----------------------------- |
| Điều kiện     | Không có sessionId      | Có sessionId (quét QR)        |
| Nút trên card | "Xem"                   | "Thêm"                        |
| Modal         | Chỉ xem, không thêm giỏ | Chọn size, ghi chú, thêm giỏ  |
| Nút phục vụ   | Ẩn                      | Hiện (Gọi phục vụ, Tính tiền) |
| Tên bàn       | Không hiện              | Hiện: "Bàn A-1"               |

### UC-19: Xem chi tiết & Thêm món vào giỏ

- **Actor:** Thực khách (đã quét QR)
- **Mô tả:** Thực khách chọn món, tùy chỉnh và thêm vào giỏ hàng
- **Luồng chính:**
  1. Tại trang Menu (chế độ gọi món), thực khách nhấn vào món ăn
  2. Modal bottom sheet hiện lên:
     - Hình ảnh, tên, giá gốc
     - **Chọn size** (nếu có biến thể): radio button với giá từng size
     - **Ghi chú nhanh**: nút bấm sẵn (Ít cay, Không hành, Làm chín kỹ)
     - **Ghi chú tùy chỉnh**: textarea 500 ký tự
     - **Số lượng**: nút +/− (mặc định 1)
  3. Nhấn **"Thêm vào giỏ"** → lưu vào CartContext
  4. Cùng món + cùng size = gộp số lượng; khác size = riêng dòng
- **Điều kiện:** Phải chọn size nếu món có biến thể

### UC-20: Quản lý giỏ hàng & Đặt món

- **Actor:** Thực khách (đã quét QR)
- **Mô tả:** Thực khách xem lại giỏ hàng, điều chỉnh và gửi đơn
- **Luồng chính:**
  1. Từ Menu nhấn thanh giỏ hàng phía dưới → chuyển đến `/cart`
  2. Hiển thị danh sách món (hình ảnh, tên, size, giá, số lượng)
  3. Điều chỉnh: tăng/giảm số lượng, xóa món
  4. Thêm ghi chú chung cho bếp (textarea)
  5. Xem tóm tắt: tạm tính, tổng tiền
  6. Nhấn **"GỌI MÓN NGAY"**
  7. Hệ thống gửi đơn:
     - **Đơn đầu tiên** của bàn → trạng thái "pending" (chờ thu ngân duyệt)
     - **Đơn thứ 2 trở đi** → trạng thái "active" (gửi thẳng bếp, trừ kho ngay)
  8. Xóa giỏ hàng, chuyển đến trang trạng thái đơn
  9. Hiện thông báo phù hợp:
     - Đơn đầu: "Đã gửi! Chờ nhân viên xác nhận"
     - Đơn sau: "Đã gửi xuống bếp! Món sẽ được chuẩn bị ngay"

### UC-21: Theo dõi trạng thái món

- **Actor:** Thực khách (đã quét QR)
- **Mô tả:** Thực khách xem trạng thái tất cả món đã gọi trong phiên
- **Luồng chính:**
  1. Truy cập `/order-status` (tự động chuyển sau khi gọi món)
  2. Hiển thị tất cả món từ mọi đơn trong phiên hiện tại
  3. Mỗi món hiện: hình ảnh, tên, size, ghi chú, giá, badge trạng thái
  4. Trạng thái món:
     - 🟡 **Chờ duyệt** (pending): đơn đang chờ thu ngân xác nhận
     - 🟠 **Đang chế biến** (preparing): bếp đang làm
     - 🟢 **Đã phục vụ** (served): đã lên bàn
     - 🔴 **Đã hủy** (cancelled): món bị hủy
  5. Nút **"+ GỌI THÊM MÓN"** phía dưới → quay lại Menu
- **Tự động:** Cập nhật mỗi 10 giây

### UC-22: Gọi phục vụ / Yêu cầu tính tiền

- **Actor:** Thực khách (đã quét QR)
- **Mô tả:** Thực khách gửi yêu cầu phục vụ trực tiếp từ app
- **Luồng chính:**
  1. Tại trang Menu (chế độ gọi món), cuộn xuống phần nút phục vụ
  2. Chọn loại yêu cầu:
     - **"Gọi phục vụ"** (call_waiter): gọi nhân viên đến bàn
     - **"Tính tiền"** (request_bill): yêu cầu thanh toán → bàn chuyển trạng thái "chờ thanh toán" phía thu ngân
  3. Gửi yêu cầu → hiện ở panel thu ngân để xử lý

### UC-23: Đánh giá sau bữa ăn

- **Actor:** Thực khách (đã quét QR)
- **Mô tả:** Sau khi thu ngân thanh toán, popup đánh giá tự động hiện lên
- **Luồng chính:**
  1. Thu ngân thanh toán → đóng phiên (session status = "closed")
  2. Trang trạng thái món (đang poll mỗi 10s) phát hiện phiên đã đóng
  3. Kiểm tra đã đánh giá chưa → nếu chưa, hiện **popup đánh giá**
  4. Popup gồm:
     - 5 sao chọn rating (bắt buộc)
     - Textarea nhận xét (không bắt buộc, tối đa 500 ký tự)
     - Nút **"Bỏ qua"** và **"Gửi đánh giá"**
  5. Sau khi gửi → màn hình cảm ơn
  6. Nếu đã đánh giá rồi → không hiện lại popup
- **Trigger:** Tự động khi phiên bị đóng, không cần thao tác từ khách

### UC-24: Đăng nhập bằng Google

- **Actor:** Thực khách
- **Mô tả:** Thực khách đăng nhập tài khoản Google để sử dụng tính năng đặt bàn
- **Luồng chính:**
  1. Truy cập `/account` → hiển thị trang đăng nhập
  2. Nhấn nút **"Đăng nhập với Google"**
  3. Supabase chuyển hướng đến Google consent
  4. Xác nhận → redirect về `/auth/callback`
  5. Hệ thống xác thực token, tìm/tạo user với role "guest"
  6. Lưu token vào localStorage, chuyển về trang Menu
- **Sau khi đăng nhập:**
  - Trang `/account` hiển thị: avatar, tên, email
  - 2 nút: **"Đặt bàn trước"** → `/reservation`, **"Xem lịch đặt bàn"** → `/my-reservations`
  - Nút đăng xuất

### UC-25: Đặt bàn trước

- **Actor:** Thực khách (đã đăng nhập)
- **Mô tả:** Thực khách đặt trước bàn ăn qua app
- **Điều kiện:** Phải đăng nhập Google
- **Luồng chính:**
  1. Truy cập `/reservation`
  2. Chọn **ngày** (7 ngày tiếp theo, cuộn ngang, hiện "Hôm nay" / thứ)
  3. Chọn **khung giờ** (12 slot: 11:00–12:30, 17:00–20:30, grid 4 cột)
  4. Chọn **số khách** (1–10 người)
  5. Nhập **yêu cầu đặc biệt** (không bắt buộc): nôi em bé, trang trí sinh nhật, vv.
  6. Nhấn **"Xác nhận đặt bàn"**
  7. Hệ thống validate: ngày phải trong tương lai, không có đặt bàn pending trùng
  8. Thành công → hiện màn hình xác nhận với nút "Xem menu"
- **Ràng buộc:** Mỗi user chỉ được 1 đặt bàn pending tại một thời điểm

### UC-26: Xem & Hủy lịch đặt bàn

- **Actor:** Thực khách (đã đăng nhập)
- **Mô tả:** Thực khách xem lịch sử đặt bàn và hủy đặt bàn chưa xác nhận
- **Luồng chính:**
  1. Truy cập `/my-reservations`
  2. **Phần "Sắp tới"**: hiện các đặt bàn pending + confirmed
     - Mỗi card: ngày (số lớn), thứ, giờ, số khách, ghi chú, badge trạng thái
     - Trạng thái: 🟡 Chờ xác nhận (pending) / 🟢 Đã xác nhận (confirmed)
     - Nút **"Hủy"** chỉ hiện cho pending
  3. **Phần "Lịch sử"**: hiện các đặt bàn cancelled + completed
     - 🔴 Đã hủy / ⚪ Hoàn thành
  4. Header có nút **"+ Đặt bàn"** → chuyển đến `/reservation`
- **Hủy đặt bàn:** Nhấn "Hủy" → xác nhận → chuyển thành "cancelled"
