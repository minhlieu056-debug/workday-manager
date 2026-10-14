-- =========================================================================
-- WORKDAY MANAGER — HỆ THỐNG QUẢN LÝ NGÀY NGHỈ PHÉP
-- CƠ SỞ DỮ LIỆU POSTGRESQL TRÊN SUPABASE (KÈM ROW LEVEL SECURITY - RLS)
-- =========================================================================

-- 1. BẬT EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TẠO TYPE ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_type AS ENUM ('full', 'half_am', 'half_pm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. BẢNG HỒ SƠ NHÂN VIÊN (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Phòng Kỹ thuật',
  position VARCHAR(100) NOT NULL DEFAULT 'Nhân viên',
  role user_role NOT NULL DEFAULT 'employee',
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BẢNG ĐƠN ĐĂNG KÝ NGHỈ PHÉP (leave_requests)
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  leave_type leave_type NOT NULL DEFAULT 'full',
  duration NUMERIC(3, 1) NOT NULL DEFAULT 1.0, -- 1.0 hoặc 0.5
  reason VARCHAR(255) NOT NULL,
  notes TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_emp_date_slot UNIQUE (employee_id, date, leave_type)
);

-- 5. BẢNG HẠN MỨC NGHỈ THEO THÁNG / PHÒNG BAN (monthly_quotas)
CREATE TABLE IF NOT EXISTS public.monthly_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  department VARCHAR(100), -- NULL nghĩa là áp dụng toàn công ty
  quota_days NUMERIC(3, 1) NOT NULL DEFAULT 4.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_quota UNIQUE (year, month, department)
);

-- 6. BẢNG CẤU HÌNH HỆ THỐNG (system_settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main_settings',
  default_monthly_quota NUMERIC(3, 1) NOT NULL DEFAULT 4.5,
  count_pending_as_used BOOLEAN NOT NULL DEFAULT FALSE,
  exclude_weekends BOOLEAN NOT NULL DEFAULT TRUE,
  company_name VARCHAR(255) NOT NULL DEFAULT 'CÔNG TY CỔ PHẦN CÔNG NGHỆ WORKDAY',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. BẢNG LỊCH SỬ THAO TÁC / NHẬT KÝ KIỂM TOÁN (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BẢO MẬT ROW LEVEL SECURITY (RLS) THEO QUYỀN
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Hàm kiểm tra vai trò người dùng hiện tại
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'employee'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Chính sách cho bảng profiles:
CREATE POLICY "Cho phép xem danh sách nhân viên" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Cho phép quản lý hồ sơ nhân viên" ON public.profiles
  FOR ALL TO anon, authenticated USING (true);

-- Chính sách cho bảng leave_requests:
CREATE POLICY "Xem đơn nghỉ phép" ON public.leave_requests
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Tạo đơn nghỉ phép" ON public.leave_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Cập nhật đơn nghỉ phép" ON public.leave_requests
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Xóa đơn nghỉ phép" ON public.leave_requests
  FOR DELETE TO anon, authenticated USING (true);

-- Chính sách cho bảng monthly_quotas & system_settings:
CREATE POLICY "Mọi người đọc cấu hình hạn mức" ON public.monthly_quotas
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Chỉnh sửa hạn mức" ON public.monthly_quotas
  FOR ALL TO anon, authenticated USING (true);

CREATE POLICY "Mọi người đọc cấu hình hệ thống" ON public.system_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Chỉnh sửa cấu hình hệ thống" ON public.system_settings
  FOR ALL TO anon, authenticated USING (true);

-- Chính sách cho bảng audit_logs:
CREATE POLICY "Xem audit log" ON public.audit_logs
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Ghi audit log" ON public.audit_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================================================================
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA CHO THÁNG 10/2026)
-- =========================================================================

-- Cài đặt mặc định
INSERT INTO public.system_settings (id, default_monthly_quota, count_pending_as_used, exclude_weekends, company_name)
VALUES ('main_settings', 4.5, false, true, 'CÔNG TY CỔ PHẦN CÔNG NGHỆ WORKDAY')
ON CONFLICT (id) DO UPDATE SET default_monthly_quota = 4.5;

-- Hồ sơ nhân viên mẫu
INSERT INTO public.profiles (id, employee_code, full_name, email, department, position, role, is_locked)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'NV000', 'Quản Trị Viên Hệ Thống', 'admin@workday.vn', 'Ban Giám đốc', 'Giám đốc Điều hành', 'admin', false),
  ('a0000000-0000-0000-0000-000000000002', 'NV001', 'Nguyễn Văn A', 'nguyenvana@workday.vn', 'Phòng Kỹ thuật', 'Kỹ sư Phần mềm', 'employee', false),
  ('a0000000-0000-0000-0000-000000000003', 'NV002', 'Trần Thị B', 'tranthib@workday.vn', 'Phòng Kinh doanh', 'Chuyên viên Kinh doanh', 'employee', false),
  ('a0000000-0000-0000-0000-000000000004', 'NV003', 'Lê Hoàng Nam', 'lehoangnam@workday.vn', 'Phòng Kỹ thuật', 'Trưởng phòng Kỹ thuật', 'manager', false),
  ('a0000000-0000-0000-0000-000000000005', 'NV004', 'Phạm Thị Mai', 'phamthimai@workday.vn', 'Phòng Nhân sự', 'Chuyên viên Nhân sự', 'employee', false),
  ('a0000000-0000-0000-0000-000000000006', 'NV005', 'Đỗ Minh Tuấn', 'dominhtuan@workday.vn', 'Phòng Kế toán', 'Kế toán viên', 'employee', true)
ON CONFLICT (employee_code) DO NOTHING;

-- Đơn nghỉ phép mẫu Tháng 10/2026:
-- Nguyễn Văn A (NV001): 3 ngày đã nghỉ (Trong hạn mức 4.5 ngày, còn lại 1.5 ngày)
INSERT INTO public.leave_requests (id, employee_id, date, leave_type, duration, reason, notes, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2026-10-05', 'full', 1.0, 'Việc gia đình', 'Về quê có việc gia đình', 'approved'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2026-10-12', 'full', 1.0, 'Nghỉ phép cá nhân', 'Giải quyết công việc riêng', 'approved'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', '2026-10-20', 'half_am', 0.5, 'Khám sức khỏe', 'Khám định kỳ buổi sáng', 'approved'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '2026-10-27', 'half_pm', 0.5, 'Việc cá nhân', 'Đi làm thủ tục hành chính', 'approved')
ON CONFLICT DO NOTHING;

-- Trần Thị B (NV002): 5 ngày đã nghỉ (VƯỢT HẠN MỨC 0.5 ngày!)
INSERT INTO public.leave_requests (id, employee_id, date, leave_type, duration, reason, notes, status)
VALUES
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', '2026-10-02', 'full', 1.0, 'Nghỉ ốm', 'Bị sốt xuất huyết điều trị tại nhà', 'approved'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '2026-10-03', 'full', 1.0, 'Nghỉ ốm', 'Điều trị bác sĩ yêu cầu', 'approved'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', '2026-10-08', 'full', 1.0, 'Việc gia đình', 'Đám cưới em gái', 'approved'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', '2026-10-15', 'full', 1.0, 'Nghỉ phép cá nhân', 'Nghỉ ngơi du lịch', 'approved'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', '2026-10-22', 'full', 1.0, 'Việc riêng', 'Giải quyết giấy tờ nhà đất', 'approved')
ON CONFLICT DO NOTHING;

-- Phạm Thị Mai (NV004): 1.5 ngày đã nghỉ, 1 ngày chờ duyệt
INSERT INTO public.leave_requests (id, employee_id, date, leave_type, duration, reason, notes, status)
VALUES
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', '2026-10-09', 'full', 1.0, 'Nghỉ phép năm', 'Nghỉ phép thường niên', 'approved'),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005', '2026-10-16', 'half_am', 0.5, 'Khám mắt', 'Đo mắt kính buổi sáng', 'approved'),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000005', '2026-10-23', 'full', 1.0, 'Việc gia đình', 'Chờ ban giám đốc phê duyệt', 'pending')
ON CONFLICT DO NOTHING;
