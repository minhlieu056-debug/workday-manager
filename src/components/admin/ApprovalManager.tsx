import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateVN, formatDateTimeVN, VIETNAMESE_MONTHS } from '../../utils/dateUtils';
import { formatDays } from '../../utils/leaveCalculator';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  AlertTriangle,
  Search,
  Calendar,
} from 'lucide-react';
import { LeaveStatus } from '../../types';

export const ApprovalManager: React.FC = () => {
  const {
    requests,
    profiles,
    approveLeave,
    rejectLeave,
    currentYear,
    currentMonth,
    companyStats,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = Array.from(new Set(profiles.map((p) => p.department))).filter(Boolean);

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const filteredRequests = requests.filter((req) => {
    if (!req.date.startsWith(monthPrefix)) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (departmentFilter !== 'all' && req.department !== departmentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (req.employee_name || '').toLowerCase().includes(q);
      const matchCode = (req.employee_code || '').toLowerCase().includes(q);
      const matchReason = req.reason.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchReason) return false;
    }

    return true;
  });

  const handleApprove = async (id: string, name?: string) => {
    const notes = prompt(`Ghi chú phê duyệt cho đơn của ${name || 'nhân viên'} (tùy chọn):`);
    if (notes !== null) {
      await approveLeave(id, notes.trim());
    }
  };

  const handleReject = async (id: string, name?: string) => {
    const notes = prompt(`Nhập lý do từ chối đơn của ${name || 'nhân viên'}:`);
    if (notes !== null) {
      await rejectLeave(id, notes.trim());
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Đã duyệt
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Từ chối
          </span>
        );
      default:
        return <span className="text-slate-400">Đã hủy</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Quy Trình Phê Duyệt
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Xét Duyệt Đơn Nghỉ Phép — Tháng {currentMonth}/{currentYear}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phê duyệt hoặc từ chối các yêu cầu nghỉ phép của thành viên trong công ty
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            {companyStats.pendingRequestsCount} đơn đang chờ duyệt
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã NV, lý do nghỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Chờ duyệt ({companyStats.pendingRequestsCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'approved' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'rejected' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Đã từ chối
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Mọi phòng ban</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Nhân viên</th>
                <th className="py-3.5 px-4">Phòng ban</th>
                <th className="py-3.5 px-4">Ngày xin nghỉ</th>
                <th className="py-3.5 px-4">Hình thức</th>
                <th className="py-3.5 px-4">Lý do & Ghi chú</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const empSummary = companyStats.summaries.find(
                    (s) => s.profile.id === req.employee_id
                  );
                  const isEmpOverQuota = empSummary?.is_over_quota;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {req.employee_name || 'Nhân viên'}
                          {isEmpOverQuota && (
                            <span
                              className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold"
                              title="Nhân viên này đã vượt hạn mức tháng!"
                            >
                              VƯỢT HẠN MỨC
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-blue-600 font-semibold">
                          {req.employee_code}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{req.department}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {formatDateVN(req.date)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {formatDays(req.duration)} ngày
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {req.leave_type === 'full'
                            ? 'Cả ngày'
                            : req.leave_type === 'half_am'
                            ? 'Sáng (AM)'
                            : 'Chiều (PM)'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800">{req.reason}</div>
                        {req.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {req.notes}
                          </div>
                        )}
                        {req.review_notes && (
                          <div className="text-[11px] text-blue-600 italic mt-0.5">
                            Ghi chú xét duyệt: {req.review_notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(req.id, req.employee_name)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => handleReject(req.id, req.employee_name)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {req.reviewed_at ? `Đã xử lý lúc ${formatDateVN(req.reviewed_at)}` : 'Đã xử lý'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không có đơn nghỉ phép nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
