# WORKDAY MANAGER — HỆ THỐNG QUẢN LÝ NGÀY NGHỈ PHÉP CÔNG TY

Hệ thống web SaaS chuyên nghiệp dành cho doanh nghiệp và tổ chức để quản lý ngày nghỉ phép nội bộ, tự động tính hạn mức, cảnh báo vượt hạn mức, xét duyệt đơn nghỉ trực tuyến và kết xuất báo cáo Excel chuẩn xác.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Trang Tổng Quan Cá Nhân (Personal Dashboard)
- **Hồ sơ thành viên**: Hiển thị họ tên, mã nhân viên, phòng ban, chức vụ.
- **Tháng/Năm theo dõi**: Dễ dàng chuyển tháng trước/sau và quay về tháng hiện tại.
- **Bộ 4 thẻ thống kê trực quan**:
  1. **Hạn mức tháng**: Mặc định 4,5 ngày/tháng (có thanh % tiến độ sử dụng).
  2. **Đã nghỉ trong tháng**: Thống kê số ngày thực tế (phân biệt ngày đã duyệt & chờ duyệt).
  3. **Số ngày phép còn lại**: Tính toán động `Hạn mức - Đã nghỉ`.
  4. **Trạng thái hạn mức**: Báo xanh "Trong hạn mức" hoặc cảnh báo đỏ rực rỡ khi vượt.
- **Cảnh báo vượt hạn mức nổi bật**: Banner màu đỏ cảnh báo tức thì khi nhân viên vượt hạn mức:
  > *"CẢNH BÁO: BẠN ĐÃ VƯỢT HẠN MỨC NGHỈ PHÉP THÁNG 10/2026! Bạn đã nghỉ 5,0 ngày (vượt hạn mức 0,5 ngày)."*

### 2. Lịch Nghỉ Tháng Trực Quan (Interactive Month Calendar)
- Lưới lịch thực tế theo chuẩn Việt Nam (Thứ Hai đến Chủ Nhật).
- Hỗ trợ lịch thực tế theo từng tháng, tính toán chính xác năm nhuận (2024: 29 ngày, 2026: 28 ngày, 2028: 29 ngày).
- Hiển thị chip màu sắc phân biệt trạng thái:
  - 🟢 **Xanh lá**: Đơn đã phê duyệt
  - 🟡 **Vàng cam**: Đơn chờ duyệt
  - 🔴 **Đỏ**: Đơn bị từ chối
  - ⚪ **Xám**: Cuối tuần (Thứ 7 & Chủ Nhật)
- **Đăng ký nghỉ nhanh**: Nhấp chuột trực tiếp vào bất kỳ ô ngày làm việc nào trên lịch để mở form đăng ký cho ngày đó.

### 3. Đăng Ký Nghỉ Phép Linh Hoạt
- Chọn hình thức nghỉ: **Cả ngày (1,0 ngày)**, **Nửa ngày - Buổi sáng (0,5 ngày)**, **Nửa ngày - Buổi chiều (0,5 ngày)**.
- Lý do nghỉ đa dạng: Nghỉ phép cá nhân, Việc gia đình, Nghỉ ốm / Khám bệnh, Nghỉ bù, Lý do khác...
- **Dự báo hạn mức trực tiếp trong form**: Hiển thị trước cho nhân viên biết nếu nộp đơn này thì sẽ dùng bao nhiêu ngày và có bị vượt hạn mức hay không.
- Nhân viên có thể xem lịch sử và **Hủy đơn** khi đơn còn ở trạng thái Chờ duyệt.

### 4. Trang Quản Trị Dành Cho Lãnh Đạo & Quản Lý
- **Tổng quan công ty**: Thống kê tổng số nhân sự, số người đã nghỉ, tổng ngày nghỉ toàn công ty, số người trong hạn mức và số người vượt hạn mức.
- **Watchlist Cảnh báo vượt hạn mức**: Danh sách các nhân sự vượt hạn mức để ban giám đốc xét duyệt theo quy chế lương/thưởng.
- **Duyệt đơn nghỉ phép 1-Click**: Phê duyệt hoặc từ chối kèm ghi chú phản hồi cho nhân viên.
- **Quản lý thành viên**: Thêm mới nhân viên, chỉnh sửa thông tin, phân quyền (Admin / Quản lý / Nhân viên), khóa hoặc mở khóa tài khoản.
- **Cài đặt hạn mức & quy tắc**: Thay đổi hạn mức mặc định (4 ngày, 4,5 ngày, 5 ngày...), cài đặt hạn mức riêng cho tháng đặc biệt, cấu hình loại trừ cuối tuần.

### 5. Báo Cáo Tháng & Xuất File Excel (.xlsx)
- Bảng báo cáo tổng hợp đầy đủ các cột:
  - **Mã nhân viên**
  - **Họ và tên**
  - **Phòng ban**
  - **Chức vụ**
  - **Hạn mức tháng**
  - **Tổng ngày nghỉ đã tính**
  - **Số ngày còn lại**
  - **Số ngày vượt**
  - **Trạng thái**
- Tìm kiếm theo họ tên, mã NV và lọc theo từng phòng ban.
- **Nút xuất Excel (.xlsx)**: Tạo file Excel chuyên nghiệp tự động định dạng độ rộng cột, tiêu đề công ty, ngày xuất và dòng tổng cộng.

---

## 👥 TÀI KHOẢN MẪU THỬ NGHIỆM (1-CLICK HOẶC NHẬP TAY)

Mật khẩu chung cho tất cả tài khoản là: `123456`

| Mã NV | Họ và tên | Email | Vai trò | Kịch bản dữ liệu Tháng 10/2026 |
| :--- | :--- | :--- | :--- | :--- |
| **NV000** | Trần Văn Quản Trị | `admin@workday.vn` | **Admin** | Quản trị toàn hệ thống, cài đặt hạn mức, duyệt đơn, xuất Excel |
| **NV001** | Nguyễn Văn A | `nguyenvana@workday.vn` | **Nhân viên** | Đã nghỉ **3,0/4,5 ngày** (Còn lại **1,5 ngày** -> Trong hạn mức) |
| **NV002** | Trần Thị B | `tranthib@workday.vn` | **Nhân viên** | Đã nghỉ **5,0/4,5 ngày** (**VƯỢT HẠN MỨC 0,5 NGÀY** -> Cảnh báo đỏ) |
| **NV003** | Lê Hoàng Nam | `lehoangnam@workday.vn` | **Quản lý** | Trưởng phòng Kỹ thuật, có quyền duyệt đơn nghỉ phép của nhân viên |
| **NV004** | Phạm Thị Mai | `phamthimai@workday.vn` | **Nhân viên** | Đã nghỉ 1,5 ngày, đang có 1 đơn **Chờ duyệt** |
| **NV005** | Đỗ Minh Tuấn | `dominhtuan@workday.vn` | **Nhân viên** | **Tài khoản bị khóa** (thử nghiệm thông báo chặn đăng nhập) |

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY TRÊN MÁY TÍNH (LOCAL)

```bash
cd workday-manager
npm install
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:5173`

> Ứng dụng tích hợp sẵn cơ chế **Zero-Config Persistent Engine**: Lưu trữ trực tiếp trên trình duyệt, không cần cấu hình phức tạp vẫn trải nghiệm trọn vẹn 100% mọi tính năng!

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI ONLINE & KẾT NỐI SUPABASE

Xem chi tiết trong file [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) để:
1. Chạy file SQL `supabase_schema.sql` trên Supabase (đã cấu hình sẵn bảng, RLS và dữ liệu mẫu).
2. Triển khai miễn phí lên Vercel trong 2 phút.
3. Gửi đường link trực tuyến cho toàn bộ nhân viên công ty truy cập trên máy tính và điện thoại.
