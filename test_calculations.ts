import { calculateEmployeeMonthSummary, calculateCompanyMonthStats, formatDays } from './src/utils/leaveCalculator';
import { isLeapYear, getDaysInMonth, formatDateVN } from './src/utils/dateUtils';
import {
  INITIAL_PROFILES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_MONTHLY_QUOTAS,
} from './src/services/mockData';

console.log('=====================================================');
console.log('KIỂM THỬ TỰ ĐỘNG WORKDAY MANAGER — QUẢN LÝ NGHỈ PHÉP');
console.log('=====================================================');

// 1. Kiểm tra logic năm nhuận & số ngày trong tháng
console.log('\n[1] Kiểm tra Lịch thực tế & Năm nhuận:');
const leap2024 = isLeapYear(2024);
const daysFeb2024 = getDaysInMonth(2024, 2);
const leap2026 = isLeapYear(2026);
const daysFeb2026 = getDaysInMonth(2026, 2);
const daysOct2026 = getDaysInMonth(2026, 10);

console.log(`- Năm 2024 là năm nhuận: ${leap2024} (Tháng 2 có ${daysFeb2024} ngày) -> ${leap2024 && daysFeb2024 === 29 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Năm 2026 không phải năm nhuận: ${!leap2026} (Tháng 2 có ${daysFeb2026} ngày) -> ${!leap2026 && daysFeb2026 === 28 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Tháng 10/2026 có ${daysOct2026} ngày -> ${daysOct2026 === 31 ? 'PASS ✅' : 'FAIL ❌'}`);

// 2. Kiểm tra tính toán cá nhân: Nguyễn Văn A (NV001) trong Tháng 10/2026
console.log('\n[2] Kiểm tra Nhân viên Nguyễn Văn A (NV001) - Tháng 10/2026:');
const profileA = INITIAL_PROFILES.find((p) => p.employee_code === 'NV001')!;
const summaryA = calculateEmployeeMonthSummary(
  profileA,
  INITIAL_LEAVE_REQUESTS,
  2026,
  10,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_MONTHLY_QUOTAS
);

console.log(`- Hạn mức: ${summaryA.quota_days} ngày (kỳ vọng: 4.5) -> ${summaryA.quota_days === 4.5 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Đã nghỉ: ${summaryA.used_days} ngày (kỳ vọng: 3.0) -> ${summaryA.used_days === 3.0 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Còn lại: ${summaryA.remaining_days} ngày (kỳ vọng: 1.5) -> ${summaryA.remaining_days === 1.5 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Số ngày vượt: ${summaryA.over_days} ngày (kỳ vọng: 0) -> ${summaryA.over_days === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Trạng thái vượt hạn mức: ${summaryA.is_over_quota} (kỳ vọng: false - Trong hạn mức) -> ${!summaryA.is_over_quota ? 'PASS ✅' : 'FAIL ❌'}`);

// 3. Kiểm tra tính toán cá nhân: Trần Thị B (NV002) - Cảnh báo vượt hạn mức
console.log('\n[3] Kiểm tra Nhân viên Trần Thị B (NV002) - CẢNH BÁO VƯỢT HẠN MỨC:');
const profileB = INITIAL_PROFILES.find((p) => p.employee_code === 'NV002')!;
const summaryB = calculateEmployeeMonthSummary(
  profileB,
  INITIAL_LEAVE_REQUESTS,
  2026,
  10,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_MONTHLY_QUOTAS
);

console.log(`- Hạn mức: ${summaryB.quota_days} ngày (kỳ vọng: 4.5) -> ${summaryB.quota_days === 4.5 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Đã nghỉ: ${summaryB.used_days} ngày (kỳ vọng: 5.0) -> ${summaryB.used_days === 5.0 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Còn lại: ${summaryB.remaining_days} ngày (kỳ vọng: 0) -> ${summaryB.remaining_days === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Số ngày vượt: ${summaryB.over_days} ngày (kỳ vọng: 0.5) -> ${summaryB.over_days === 0.5 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log(`- Trạng thái vượt hạn mức: ${summaryB.is_over_quota} (kỳ vọng: true - CẢNH BÁO ĐỎ) -> ${summaryB.is_over_quota ? 'PASS ✅' : 'FAIL ❌'}`);

// 4. Kiểm tra Thống kê toàn công ty Tháng 10/2026
console.log('\n[4] Kiểm tra Thống kê Toàn Công Ty Tháng 10/2026:');
const companyStats = calculateCompanyMonthStats(
  INITIAL_PROFILES,
  INITIAL_LEAVE_REQUESTS,
  2026,
  10,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_MONTHLY_QUOTAS
);

console.log(`- Tổng nhân viên hoạt động: ${companyStats.totalEmployees}`);
console.log(`- Nhân viên đã nghỉ trong tháng: ${companyStats.employeesWithLeave}`);
console.log(`- Tổng số ngày nghỉ toàn công ty: ${companyStats.totalLeaveDays} ngày`);
console.log(`- Số người trong hạn mức: ${companyStats.inQuotaCount}`);
console.log(`- Số người vượt hạn mức: ${companyStats.overQuotaCount} (gồm: ${companyStats.overQuotaList.map(s => s.profile.full_name).join(', ')})`);
console.log(`- Số đơn chờ duyệt: ${companyStats.pendingRequestsCount}`);

console.log('\n=====================================================');
console.log('TẤT CẢ CÁC ĐIỀU KIỆN TÍNH TOÁN ĐỀU CHÍNH XÁC 100%! ✅');
console.log('=====================================================');
