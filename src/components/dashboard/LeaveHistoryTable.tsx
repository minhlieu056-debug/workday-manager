import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateVN, formatDateTimeVN } from '../../utils/dateUtils';
import { formatDays } from '../../utils/leaveCalculator';
import { LeaveStatus } from '../../types';
import { Filter, Trash2, Calendar, FileQuestion, CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';

interface LeaveHistoryTableProps {
  onOpenRegisterModal: () => void;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  onOpenRegisterModal,
}) => {
  const { myAllRequests, cancelLeave, currentYear, currentMonth } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyThisMonth, setOnlyThisMonth] = useState<boolean>(true);

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const filteredRequests = myAllRequests.filter((req) => {
    if (onlyThisMonth && !req.date.startsWith(monthPrefix)) return false;
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Chờ duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Từ chối
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Ban className="w-3.5 h-3.5" />
            Đã hủy
          </span>
        );
    }
  };

  const getTypeText = (type: string, duration: number) => {
    switch (type) {
      case 'full':
        return `Cả ngày (${formatDays(duration)} ngày)`;
      case 'half_am':
        return `Nửa ngày - Sáng (${formatDays(duration)} ngày)`;
      case 'half_pm':
        return `Nửa ngày - Chiều (${formatDays(duration)} ngày)`;
      default:
        return `${formatDays(duration)} ngày`;
    }
  };

  const handleCancel = async (id: string, date: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn nghỉ ngày ${formatDateVN(date)} không?`)) {
      await cancelLeave(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Lịch Sử Đăng Ký Nghỉ Phép
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chi tiết các yêu cầu nghỉ phép và trạng thái phê duyệt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month toggle */}
          <button
            onClick={() => setOnlyThisMonth(!onlyThisMonth)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              onlyThisMonth
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {onlyThisMonth ? `Tháng ${currentMonth}/${currentYear}` : 'Tất cả các tháng'}
          </button>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredRequests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-100/50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ngày nghỉ</th>
                <th className="py-3 px-4">Hình thức</th>
                <th className="py-3 px-4">Lý do & Ghi chú</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian gửi</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {formatDateVN(req.date)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {getTypeText(req.leave_type, req.duration)}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-800">{req.reason}</div>
                    {req.notes && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{req.notes}</div>
                    )}
                    {req.review_notes && (
                      <div className="text-[11px] text-rose-600 italic mt-0.5">
                        Phản hồi quản lý: {req.review_notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDateTimeVN(req.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {req.status === 'pending' ? (
                      <button
                        onClick={() => handleCancel(req.id, req.date)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors font-medium text-[11px]"
                        title="Hủy đơn này"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hủy đơn
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Không khả dụng</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Không có đơn nghỉ phép nào</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {onlyThisMonth
                ? `Chưa có đơn nghỉ nào được đăng ký trong Tháng ${currentMonth}/${currentYear}.`
                : 'Bạn chưa tạo đơn đăng ký nghỉ phép nào.'}
            </p>
          </div>
          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            Đăng ký ngày nghỉ ngay
          </button>
        </div>
      )}
    </div>
  );
};
