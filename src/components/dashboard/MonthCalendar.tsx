import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  generateCalendarMonth,
  VIETNAMESE_DAYS_SHORT,
  formatDateVN,
} from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { LeaveRequest } from '../../types';

interface MonthCalendarProps {
  onSelectDateToRegister: (dateStr: string) => void;
  filterEmployeeId?: string | null; // null = all or current
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  onSelectDateToRegister,
  filterEmployeeId,
}) => {
  const { currentUser } = useAuth();
  const {
    currentYear,
    currentMonth,
    nextMonth,
    prevMonth,
    goToTodayMonth,
    requests,
  } = useApp();

  const calendarCells = generateCalendarMonth(currentYear, currentMonth);

  // Filter requests according to view scope (current user or specific employee)
  const targetEmployeeId = filterEmployeeId !== undefined ? filterEmployeeId : currentUser?.id;
  const relevantRequests = requests.filter((r) => {
    if (r.status === 'cancelled') return false;
    if (targetEmployeeId) {
      return r.employee_id === targetEmployeeId;
    }
    return true;
  });

  const getRequestsForDate = (dateStr: string): LeaveRequest[] => {
    return relevantRequests.filter((r) => r.date === dateStr);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getLeaveTypeText = (type: string) => {
    switch (type) {
      case 'full':
        return 'Cả ngày (1.0)';
      case 'half_am':
        return 'Sáng (0.5)';
      case 'half_pm':
        return 'Chiều (0.5)';
      default:
        return 'Nghỉ';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Calendar Top Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Lịch Nghỉ Tháng {currentMonth}/{currentYear}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-all"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToTodayMonth}
            className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-400 rounded-xl transition-all shadow-xs"
          >
            Hôm nay (T10/2026)
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-all"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Header (Mon -> Sun) */}
      <div className="grid grid-cols-7 border-b border-slate-200 text-center bg-slate-100/70 py-2.5 text-xs font-bold text-slate-600">
        <div>Thứ 2</div>
        <div>Thứ 3</div>
        <div>Thứ 4</div>
        <div>Thứ 5</div>
        <div>Thứ 6</div>
        <div className="text-rose-500">Thứ 7</div>
        <div className="text-rose-500">Chủ Nhật</div>
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 border-b border-slate-100">
        {calendarCells.map((cell, idx) => {
          const dayRequests = getRequestsForDate(cell.dateStr);
          const hasRequests = dayRequests.length > 0;
          const isWeekendCell = cell.isWeekend;

          return (
            <div
              key={`${cell.dateStr}-${idx}`}
              onClick={() => {
                if (cell.isCurrentMonth && !isWeekendCell) {
                  onSelectDateToRegister(cell.dateStr);
                }
              }}
              className={`min-h-[95px] sm:min-h-[110px] p-2 transition-all relative flex flex-col justify-between group ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/50 text-slate-300'
                  : isWeekendCell
                  ? 'bg-slate-50/80 text-slate-400'
                  : 'bg-white hover:bg-blue-50/30 cursor-pointer'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    cell.isToday
                      ? 'bg-blue-600 text-white shadow-sm'
                      : !cell.isCurrentMonth
                      ? 'text-slate-300'
                      : isWeekendCell
                      ? 'text-rose-400'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add hover button for active weekdays */}
                {cell.isCurrentMonth && !isWeekendCell && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDateToRegister(cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-opacity"
                    title={`Đăng ký nghỉ ngày ${formatDateVN(cell.dateStr)}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Day leave request chips */}
              <div className="mt-1 space-y-1 overflow-hidden">
                {dayRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border truncate ${getStatusBadge(
                      req.status
                    )}`}
                    title={`${req.employee_name || 'Nhân viên'}: ${getLeaveTypeText(
                      req.leave_type
                    )} - ${req.reason}`}
                  >
                    <div className="font-bold truncate">{getLeaveTypeText(req.leave_type)}</div>
                    <div className="text-[9px] opacity-80 truncate">{req.reason}</div>
                  </div>
                ))}
              </div>

              {/* Weekend label */}
              {isWeekendCell && cell.isCurrentMonth && !hasRequests && (
                <div className="text-[9px] font-medium text-slate-300 text-center py-1">
                  Cuối tuần
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="p-3.5 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Đã duyệt (Approved)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Chờ duyệt (Pending)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Từ chối (Rejected)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Thứ 7 / CN (Cuối tuần)</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] italic">
          * Nhấp vào ô ngày làm việc bất kỳ để đăng ký nghỉ nhanh
        </div>
      </div>
    </div>
  );
};
