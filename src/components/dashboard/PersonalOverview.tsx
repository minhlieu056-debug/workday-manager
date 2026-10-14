import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { MonthCalendar } from './MonthCalendar';
import { LeaveHistoryTable } from './LeaveHistoryTable';
import { formatDays } from '../../utils/leaveCalculator';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  PlusCircle,
  Building,
  User,
  ShieldAlert,
} from 'lucide-react';

interface PersonalOverviewProps {
  onOpenLeaveModal: (date?: string) => void;
}

export const PersonalOverview: React.FC<PersonalOverviewProps> = ({ onOpenLeaveModal }) => {
  const { currentUser } = useAuth();
  const { personalSummary, currentYear, currentMonth, myRequestsThisMonth } = useApp();

  if (!currentUser || !personalSummary) return null;

  const used = personalSummary.used_days;
  const quota = personalSummary.quota_days;
  const remaining = personalSummary.remaining_days;
  const over = personalSummary.over_days;
  const isOver = personalSummary.is_over_quota;
  const usagePercent = quota > 0 ? (used / quota) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Employee Personal Info */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                currentUser.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser.full_name
                )}&background=ffffff&color=2563eb`
              }
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase">
                  Mã: {currentUser.employee_code}
                </span>
                <span className="bg-emerald-500/30 text-emerald-100 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  {currentUser.position}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{currentUser.full_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  {currentUser.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Đang xem: Tháng {currentMonth}/{currentYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenLeaveModal()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 active:scale-[0.98] font-bold text-xs shadow-lg shadow-black/10 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Đăng ký ngày nghỉ phép
            </button>
          </div>
        </div>
      </div>

      {/* Critical Over-Quota Alert Banner (When Over Quota) */}
      {isOver && (
        <div className="rounded-2xl p-5 bg-rose-600 text-white shadow-xl shadow-rose-600/20 border border-rose-500 flex items-start gap-4 animate-in slide-in-from-top-4">
          <div className="p-3 bg-white/20 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-base font-extrabold tracking-tight">
              CẢNH BÁO: BẠN ĐÃ VƯỢT HẠN MỨC NGHỈ PHÉP THÁNG {currentMonth}/{currentYear}!
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
              Bạn đã nghỉ tổng cộng <strong>{formatDays(used)} ngày</strong> trong tháng này, vượt quá hạn mức quy định ({formatDays(quota)} ngày). Số ngày vượt hạn mức là{' '}
              <strong className="underline text-white font-black text-sm">
                {formatDays(over)} ngày
              </strong>
              . Quản lý và bộ phận nhân sự đã được hệ thống thông báo để xét duyệt theo quy chế công ty.
            </p>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Hạn mức tháng */}
        <StatCard
          title={`Hạn mức Tháng ${currentMonth}/${currentYear}`}
          value={`${formatDays(quota)} ngày`}
          icon={<Clock className="w-5 h-5" />}
          variant="blue"
          progressPercent={usagePercent}
          subtitle={`Quy chuẩn công ty: ${formatDays(quota)} ngày / tháng`}
        />

        {/* Stat 2: Đã nghỉ trong tháng */}
        <StatCard
          title="Đã nghỉ trong tháng"
          value={`${formatDays(used)} ngày`}
          icon={<Calendar className="w-5 h-5" />}
          variant={isOver ? 'rose' : 'amber'}
          isAlert={isOver}
          subtitle={`Đã duyệt: ${formatDays(personalSummary.approved_days)} ngày • Chờ duyệt: ${formatDays(
            personalSummary.pending_days
          )} ngày`}
        />

        {/* Stat 3: Số ngày phép còn lại */}
        <StatCard
          title="Số ngày phép còn lại"
          value={`${formatDays(remaining)} ngày`}
          icon={<CheckCircle className="w-5 h-5" />}
          variant={remaining === 0 ? 'slate' : 'emerald'}
          badge={remaining > 0 ? 'Khả dụng' : 'Hết phép'}
          subtitle={
            remaining > 0
              ? `Bạn còn ${formatDays(remaining)} ngày phép chưa sử dụng`
              : 'Đã dùng tối đa hạn mức tháng này'
          }
        />

        {/* Stat 4: Trạng thái hạn mức */}
        <StatCard
          title="Trạng thái hạn mức"
          value={isOver ? `Vượt ${formatDays(over)} ngày` : 'Trong hạn mức'}
          icon={<AlertOctagon className="w-5 h-5" />}
          variant={isOver ? 'rose' : 'emerald'}
          isAlert={isOver}
          badge={isOver ? 'CẢNH BÁO ĐỎ' : 'BÌNH THƯỜNG'}
          subtitle={
            isOver
              ? `Vượt ${formatDays(over)} ngày so với tiêu chuẩn`
              : `Nghỉ ${formatDays(used)}/${formatDays(quota)} ngày quy định`
          }
        />
      </div>

      {/* Main Content: Interactive Calendar & Recent Leaves */}
      <div className="space-y-6">
        <MonthCalendar onSelectDateToRegister={(dateStr) => onOpenLeaveModal(dateStr)} />

        <LeaveHistoryTable onOpenRegisterModal={() => onOpenLeaveModal()} />
      </div>
    </div>
  );
};
