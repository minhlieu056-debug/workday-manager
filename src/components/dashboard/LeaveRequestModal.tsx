import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { LeaveType } from '../../types';
import { formatDays } from '../../utils/leaveCalculator';
import { formatDateVN, toISODateString } from '../../utils/dateUtils';
import { Calendar, Clock, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string | null;
}

const COMMON_REASONS = [
  'Nghỉ phép cá nhân',
  'Nghỉ ốm / Khám sức khỏe',
  'Việc gia đình',
  'Nghỉ bù làm thêm giờ',
  'Du lịch / Nghỉ dưỡng',
  'Lý do khác',
];

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
}) => {
  const { currentUser } = useAuth();
  const { registerLeave, personalSummary, currentYear, currentMonth } = useApp();

  const [date, setDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveType>('full');
  const [reasonCategory, setReasonCategory] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultDate) {
        setDate(defaultDate);
      } else {
        // Default to a date within the currently viewed month (e.g. October 15, 2026)
        const targetDay = new Date().getDate();
        const initialDate = new Date(currentYear, currentMonth - 1, targetDay);
        setDate(toISODateString(initialDate));
      }
      setLeaveType('full');
      setReasonCategory(COMMON_REASONS[0]);
      setCustomReason('');
      setNotes('');
    }
  }, [isOpen, defaultDate, currentYear, currentMonth]);

  if (!currentUser) return null;

  const currentDuration = leaveType === 'full' ? 1.0 : 0.5;
  const currentUsed = personalSummary?.used_days || 0;
  const currentQuota = personalSummary?.quota_days || 4.5;
  const projectedUsed = Math.round((currentUsed + currentDuration) * 10) / 10;
  const willExceed = projectedUsed > currentQuota;
  const exceedAmount = willExceed ? Math.round((projectedUsed - currentQuota) * 10) / 10 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const finalReason = reasonCategory === 'Lý do khác' ? customReason.trim() : reasonCategory;
    if (!finalReason) {
      alert('Vui lòng nhập lý do nghỉ phép.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerLeave({
      date,
      leave_type: leaveType,
      reason: finalReason,
      notes: notes.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đăng Ký Ngày Nghỉ Phép"
      subtitle={`Nhân viên: ${currentUser.full_name} (${currentUser.employee_code}) • ${currentUser.department}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Ngày đăng ký nghỉ
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          />
          {date && (
            <p className="text-xs text-slate-500 mt-1">
              Ngày đã chọn: <strong className="text-slate-800">{formatDateVN(date)}</strong>
            </p>
          )}
        </div>

        {/* Leave Type (Full / Half AM / Half PM) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Hình thức nghỉ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setLeaveType('full')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leaveType === 'full'
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">Cả ngày</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">1,0 ngày phép</div>
            </button>

            <button
              type="button"
              onClick={() => setLeaveType('half_am')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leaveType === 'half_am'
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">Nửa ngày - Sáng</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-0.5">0,5 ngày phép</div>
            </button>

            <button
              type="button"
              onClick={() => setLeaveType('half_pm')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leaveType === 'half_pm'
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">Nửa ngày - Chiều</div>
              <div className="text-[11px] text-amber-600 font-semibold mt-0.5">0,5 ngày phép</div>
            </button>
          </div>
        </div>

        {/* Reason category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Lý do nghỉ phép
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            {COMMON_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {reasonCategory === 'Lý do khác' && (
            <input
              type="text"
              required
              placeholder="Nhập lý do chi tiết..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="mt-2 w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Ghi chú thêm (Bàn giao công việc, người hỗ trợ...)
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: Đã bàn giao các tác vụ gấp cho anh Nam hỗ trợ..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal resize-none"
          />
        </div>

        {/* Live Calculation Preview */}
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            willExceed
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              {willExceed ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              Dự báo hạn mức Tháng {currentMonth}/{currentYear}:
            </span>
            <span className="text-slate-900 font-extrabold">
              Hạn mức: {formatDays(currentQuota)} ngày
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
            <div>
              Đã nghỉ hiện tại: <strong>{formatDays(currentUsed)} ngày</strong>
            </div>
            <div>
              Đơn này cộng thêm: <strong>+{formatDays(currentDuration)} ngày</strong>
            </div>
            <div>
              Tổng sau khi duyệt: <strong>{formatDays(projectedUsed)} ngày</strong>
            </div>
            <div>
              {willExceed ? (
                <span className="text-rose-600 font-bold">
                  Vượt hạn mức: +{formatDays(exceedAmount)} ngày
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  Còn lại: {formatDays(currentQuota - projectedUsed)} ngày
                </span>
              )}
            </div>
          </div>

          {willExceed && (
            <div className="mt-2 text-rose-700 font-semibold bg-rose-100/70 p-2 rounded-lg">
              Cảnh báo: Đơn này sẽ khiến bạn vượt hạn mức tháng {formatDays(exceedAmount)} ngày. Quản lý sẽ nhận được cảnh báo khi xét duyệt.
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Đăng Ký'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
