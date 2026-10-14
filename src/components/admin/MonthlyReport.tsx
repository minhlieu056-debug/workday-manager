import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDays } from '../../utils/leaveCalculator';
import { exportMonthlyReportToExcel } from '../../lib/excelExport';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { VIETNAMESE_MONTHS } from '../../utils/dateUtils';

export const MonthlyReport: React.FC = () => {
  const {
    companyStats,
    currentYear,
    currentMonth,
    setMonth,
    setYear,
    settings,
    profiles,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Unique departments for filter dropdown
  const departments = Array.from(new Set(profiles.map((p) => p.department))).filter(Boolean);

  const filteredSummaries = companyStats.summaries.filter((s) => {
    const matchSearch =
      s.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.profile.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = departmentFilter === 'all' || s.profile.department === departmentFilter;
    return matchSearch && matchDept;
  });

  const handleExportExcel = () => {
    exportMonthlyReportToExcel(filteredSummaries, currentYear, currentMonth, settings);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Báo Cáo & Thống Kê
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Báo Cáo Tổng Hợp Nghỉ Phép — {VIETNAMESE_MONTHS[currentMonth - 1]}, {currentYear}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu tổng hợp thực tế từ hồ sơ và các đơn nghỉ phép đã được phê duyệt
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Xuất File Excel (.xlsx)
        </button>
      </div>

      {/* Filter and Month Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã NV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={currentMonth}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              {VIETNAMESE_MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold">
            <select
              value={currentYear}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã NV</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Phòng ban</th>
                <th className="py-3.5 px-4">Hạn mức tháng</th>
                <th className="py-3.5 px-4">Tổng ngày nghỉ đã tính</th>
                <th className="py-3.5 px-4">Số ngày còn lại</th>
                <th className="py-3.5 px-4">Số ngày vượt</th>
                <th className="py-3.5 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((item, index) => {
                  const isOver = item.is_over_quota;

                  return (
                    <tr
                      key={item.profile.id}
                      className={`transition-colors ${
                        isOver ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {item.profile.employee_code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.profile.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.profile.department}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {formatDays(item.quota_days)} ngày
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatDays(item.used_days)} ngày
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {formatDays(item.remaining_days)} ngày
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {isOver ? (
                          <span className="text-rose-600 font-extrabold text-sm">
                            +{formatDays(item.over_days)} ngày
                          </span>
                        ) : (
                          <span className="text-slate-400">0 ngày</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOver ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            VƯỢT HẠN MỨC
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Trong hạn mức
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Total Footer Row */}
            {filteredSummaries.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900 text-xs">
                  <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider">
                    Tổng cộng ({filteredSummaries.length} nhân viên):
                  </td>
                  <td className="py-3.5 px-4">
                    {formatDays(filteredSummaries.reduce((acc, c) => acc + c.quota_days, 0))} ngày
                  </td>
                  <td className="py-3.5 px-4 text-blue-700">
                    {formatDays(filteredSummaries.reduce((acc, c) => acc + c.used_days, 0))} ngày
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700">
                    {formatDays(filteredSummaries.reduce((acc, c) => acc + c.remaining_days, 0))} ngày
                  </td>
                  <td className="py-3.5 px-4 text-rose-600">
                    +{formatDays(filteredSummaries.reduce((acc, c) => acc + c.over_days, 0))} ngày
                  </td>
                  <td className="py-3.5 px-4">
                    {filteredSummaries.filter((c) => c.is_over_quota).length} nhân viên vượt hạn mức
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
