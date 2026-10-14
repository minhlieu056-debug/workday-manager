import * as XLSX from 'xlsx';
import { EmployeeMonthlySummary, SystemSettings } from '../types';
import { formatDateVN } from '../utils/dateUtils';
import { formatDays } from '../utils/leaveCalculator';

export function exportMonthlyReportToExcel(
  summaries: EmployeeMonthlySummary[],
  year: number,
  month: number,
  settings: SystemSettings
) {
  const title = `BÁO CÁO TỔNG HỢP NGHỈ PHÉP - THÁNG ${month}/${year}`;
  const nowStr = formatDateVN(new Date());

  // Prepare data rows
  const excelRows = summaries.map((s, index) => {
    return {
      'STT': index + 1,
      'Mã Nhân Viên': s.profile.employee_code,
      'Họ Và Tên': s.profile.full_name,
      'Phòng Ban': s.profile.department,
      'Chức Vụ': s.profile.position,
      'Hạn Mức Tháng (ngày)': s.quota_days,
      'Đã Nghỉ (ngày)': s.used_days,
      'Còn Lại (ngày)': s.remaining_days,
      'Vượt Hạn Mức (ngày)': s.over_days > 0 ? s.over_days : 0,
      'Trạng Thái': s.is_over_quota ? `VƯỢT HẠN MỨC (+${formatDays(s.over_days)})` : 'Trong hạn mức',
      'Đơn Đã Duyệt': s.approved_days,
      'Đơn Chờ Duyệt': s.pending_days,
    };
  });

  // Calculate totals
  const totalEmployees = summaries.length;
  const totalLeaveDays = summaries.reduce((acc, curr) => acc + curr.used_days, 0);
  const totalOverQuota = summaries.filter(s => s.is_over_quota).length;

  // Create worksheet with top header metadata
  const worksheet = XLSX.utils.aoa_to_sheet([
    [settings.company_name.toUpperCase()],
    [title],
    [`Ngày xuất báo cáo: ${nowStr} | Tổng nhân viên: ${totalEmployees} | Tổng ngày nghỉ: ${formatDays(totalLeaveDays)} | Nhân viên vượt hạn mức: ${totalOverQuota}`],
    [], // blank row
  ]);

  // Append data rows starting at cell A5
  XLSX.utils.sheet_add_json(worksheet, excelRows, { origin: 'A5' });

  // Auto-fit column widths
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã NV
    { wch: 25 }, // Họ và tên
    { wch: 22 }, // Phòng ban
    { wch: 22 }, // Chức vụ
    { wch: 20 }, // Hạn mức
    { wch: 18 }, // Đã nghỉ
    { wch: 16 }, // Còn lại
    { wch: 20 }, // Vượt hạn mức
    { wch: 26 }, // Trạng thái
    { wch: 15 }, // Đã duyệt
    { wch: 15 }, // Chờ duyệt
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `T${month}_${year}`);

  // Trigger file download
  const fileName = `Bao_Cao_Nghi_Phep_Thang_${String(month).padStart(2, '0')}_${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
