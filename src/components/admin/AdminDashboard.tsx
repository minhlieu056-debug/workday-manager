import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { formatDays } from '../../utils/leaveCalculator';
import { formatDateVN } from '../../utils/dateUtils';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  CheckSquare,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { ActiveTab } from '../common/Sidebar';

interface AdminDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { companyStats, currentMonth, currentYear, requests, approveLeave, rejectLeave } = useApp();

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const pendingRequests = requests.filter(
    (r) => r.status === 'pending' && r.date.startsWith(monthPrefix)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Trang Quản Trị Hệ Thống
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Tổng Quan Nghỉ Phép Công Ty — Tháng {currentMonth}/{currentYear}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tổng quan hạn mức nghỉ phép, duyệt đơn và xử lý các trường hợp vượt hạn mức
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('monthly_report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xem Báo Cáo Tháng & Excel
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            Duyệt đơn ({companyStats.pendingRequestsCount})
          </button>
        </div>
      </div>

      {/* 5 Management Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total employees */}
        <StatCard
          title="Tổng nhân viên"
          value={companyStats.totalEmployees}
          icon={<Users className="w-5 h-5" />}
          variant="slate"
          subtitle="Tài khoản đang hoạt động"
        />

        {/* Employees with leave */}
        <StatCard
          title="Nhân viên đã nghỉ"
          value={companyStats.employeesWithLeave}
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="blue"
          subtitle={`Chiếm ${
            companyStats.totalEmployees > 0
              ? Math.round((companyStats.employeesWithLeave / companyStats.totalEmployees) * 100)
              : 0
          }% tổng nhân sự`}
        />

        {/* Total leave days */}
        <StatCard
          title="Tổng ngày nghỉ công ty"
          value={`${formatDays(companyStats.totalLeaveDays)} ngày`}
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
          subtitle="Đã tính trong tháng này"
        />

        {/* In-quota count */}
        <StatCard
          title="Trong hạn mức"
          value={companyStats.inQuotaCount}
          icon={<CheckCircle className="w-5 h-5" />}
          variant="emerald"
          badge="ĐẠT CHUẨN"
          subtitle="Không vượt ngày phép"
        />

        {/* Over-quota count */}
        <StatCard
          title="Vượt hạn mức"
          value={companyStats.overQuotaCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={companyStats.overQuotaCount > 0 ? 'rose' : 'slate'}
          isAlert={companyStats.overQuotaCount > 0}
          badge={companyStats.overQuotaCount > 0 ? 'CẢNH BÁO' : '0 NGƯỜI'}
          subtitle={
            companyStats.overQuotaCount > 0 ? 'Cần ban quản lý rà soát' : 'Tất cả trong hạn mức'
          }
        />
      </div>

      {/* Over-Quota Watchlist (Danh sách cảnh báo cần xử lý) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Danh Sách Cảnh Báo Nhân Viên Vượt Hạn Mức
              </h2>
              <p className="text-xs text-slate-500">
                Nhân viên có tổng ngày nghỉ trong Tháng {currentMonth}/{currentYear} vượt quá hạn mức quy định
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              companyStats.overQuotaCount > 0
                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {companyStats.overQuotaCount} trường hợp
          </span>
        </div>

        {companyStats.overQuotaList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã NV</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Chức vụ</th>
                  <th className="py-3 px-4">Hạn mức tháng</th>
                  <th className="py-3 px-4">Đã nghỉ</th>
                  <th className="py-3 px-4">Số ngày vượt</th>
                  <th className="py-3 px-4">Trạng thái cảnh báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyStats.overQuotaList.map((item) => (
                  <tr key={item.profile.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.profile.employee_code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.profile.full_name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {item.profile.department}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.profile.position}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {formatDays(item.quota_days)} ngày
                    </td>
                    <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                      {formatDays(item.used_days)} ngày
                    </td>
                    <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                      +{formatDays(item.over_days)} ngày
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        VƯỢT HẠN MỨC
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              Không có nhân viên nào vượt hạn mức trong tháng này
            </p>
            <p className="text-xs text-slate-500">
              Tất cả các thành viên đều nghỉ trong phạm vi hạn mức quy định.
            </p>
          </div>
        )}
      </div>

      {/* Pending Approvals Quick Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Đơn Nghỉ Phép Chờ Phê Duyệt ({pendingRequests.length})
            </h2>
            <p className="text-xs text-slate-500">
              Xem nhanh và duyệt đơn nghỉ phép của nhân viên trong tháng
            </p>
          </div>
          <button
            onClick={() => setActiveTab('approvals')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Ngày nghỉ</th>
                  <th className="py-3 px-4">Thời lượng</th>
                  <th className="py-3 px-4">Lý do</th>
                  <th className="py-3 px-4 text-right">Phê duyệt nhanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {req.employee_name} ({req.employee_code})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{req.department}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatDateVN(req.date)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatDays(req.duration)} ngày ({req.leave_type === 'full' ? 'Cả ngày' : 'Nửa ngày'})
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate">{req.reason}</td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => approveLeave(req.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Nhập lý do từ chối:');
                          if (note !== null) rejectLeave(req.id, note);
                        }}
                        className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-colors"
                      >
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Hiện không có đơn nào đang chờ duyệt.
          </div>
        )}
      </div>
    </div>
  );
};
