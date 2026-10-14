# HƯỚNG DẪN TRIỂN KHAI WORKDAY MANAGER LÊN INTERNET

Tài liệu này hướng dẫn bạn đưa ứng dụng **WORKDAY MANAGER** lên mạng internet để toàn bộ thành viên trong công ty có thể mở đường link trên máy tính, điện thoại, máy tính bảng để đăng nhập và đồng bộ dữ liệu chung một cơ sở dữ liệu.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG
- **Frontend**: React + TypeScript + Tailwind CSS (Deploy trên Vercel hoặc Netlify).
- **Cơ sở dữ liệu & Xác thực**: Supabase (PostgreSQL Cloud) với bảo mật Row Level Security (RLS).
- **Chia sẻ**: Đường link web chuẩn HTTPS (ví dụ: `https://workday-manager.vercel.app`), nhân viên không cần cài đặt bất kỳ phần mềm nào.

---

## BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU TRÊN SUPABASE (3 PHÚT)

1. Truy cập [https://supabase.com](https://supabase.com) và đăng ký/đăng nhập tài khoản miễn phí.
2. Bấm **"New project"**, đặt tên dự án: `workday-manager`, chọn mật khẩu cơ sở dữ liệu và khu vực máy chủ (chọn Singapore `ap-southeast-1` để có tốc độ nhanh nhất tại Việt Nam).
3. Sau khi dự án khởi tạo xong, vào menu bên trái chọn **"SQL Editor"**.
4. Mở file [supabase_schema.sql](./supabase_schema.sql) có sẵn trong thư mục dự án này, copy toàn bộ nội dung và dán vào SQL Editor trên Supabase.
5. Bấm nút **"Run"** (chạy script).
   > 🎉 Script sẽ tự động tạo đầy đủ các bảng: `profiles`, `leave_requests`, `monthly_quotas`, `system_settings`, `audit_logs`, thiết lập chính sách bảo mật RLS và nạp sẵn dữ liệu mẫu cho Tháng 10/2026.
6. Vào mục **Project Settings -> API**:
   - Copy **Project URL** (ví dụ: `https://xyzcompany.supabase.co`).
   - Copy **anon / public key** (chuỗi ký tự bắt đầu bằng `eyJ...`).

---

## BƯỚC 2: TRIỂN KHAI ỨNG DỤNG LÊN VERCEL (2 PHÚT)

### Cách A: Triển khai qua GitHub (Khuyên dùng)
1. Đẩy mã nguồn dự án này lên tài khoản GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "Workday Manager Initial Release"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/workday-manager.git
   git push -u origin main
   ```
2. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
3. Bấm **"Add New Project"**, chọn repository `workday-manager`.
4. Trong phần **Environment Variables**, thêm 2 biến môi trường:
   - `VITE_SUPABASE_URL`: (Dán Project URL lấy ở Bước 1)
   - `VITE_SUPABASE_ANON_KEY`: (Dán Anon Public Key lấy ở Bước 1)
5. Bấm **"Deploy"**.
   > Sau khoảng 45 giây, Vercel sẽ cung cấp cho bạn một đường link chính thức dạng:  
   > `https://workday-manager.vercel.app`

---

## BƯỚC 3: HƯỚNG DẪN GỬI LINK VÀ HƯỚNG DẪN NHÂN VIÊN SỬ DỤNG

Sau khi triển khai thành công, bạn có thể gửi email hoặc tin nhắn thông báo nội bộ cho toàn thể nhân viên theo mẫu sau:

### ✉️ Mẫu email / tin nhắn gửi nhân viên:

```text
Kính gửi toàn thể Anh/Chị/Em thành viên công ty,

Phòng Hành chính - Nhân sự xin thông báo ra mắt Hệ thống Quản lý Ngày Nghỉ Phép Trực Tuyến: WORKDAY MANAGER.

🔗 Đường link truy cập: https://workday-manager.vercel.app
(Có thể mở trực tiếp trên máy tính, laptop, điện thoại hoặc máy tính bảng)

👤 Thông tin tài khoản đăng nhập:
- Email đăng nhập: [email_cong_ty_cua_ban]
- Mật khẩu mặc định: 123456 (Anh/Chị vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên)

📌 Các chức năng chính dành cho nhân viên:
1. Theo dõi hạn mức nghỉ phép hàng tháng (Mặc định: 4,5 ngày/tháng).
2. Xem số ngày đã nghỉ thực tế và số ngày phép còn lại.
3. Nhấp trực tiếp vào lịch tháng để đăng ký nghỉ (nguyên ngày hoặc nửa ngày sáng/chiều).
4. Hệ thống sẽ tự động cảnh báo nếu số ngày đăng ký vượt quá hạn mức quy định.
5. Xem lịch sử xét duyệt và hủy đơn khi còn ở trạng thái Chờ duyệt.

Mọi thắc mắc hoặc cần hỗ trợ tài khoản, vui lòng liên hệ Ban Quản trị hoặc Phòng Nhân sự.
Trân trọng cảm ơn!
```

---

## BƯỚC 4: QUẢN TRỊ VIÊN THÊM THÀNH VIÊN MỚI

Khi công ty có nhân viên mới gia nhập, Quản trị viên chỉ cần:
1. Đăng nhập bằng tài khoản Admin (`admin@workday.vn`).
2. Vào mục **"Quản lý nhân viên"** trên Sidebar.
3. Bấm nút **"Thêm Nhân Viên Mới"**.
4. Nhập Mã nhân viên (ví dụ: `NV006`), Họ tên, Email, Phòng ban, Chức vụ và chọn vai trò `Nhân viên`.
5. Bấm **"Tạo Nhân Viên"**. Tài khoản mới lập tức có hiệu lực và nhân viên có thể đăng nhập ngay mà không cần lập trình lại hệ thống.
