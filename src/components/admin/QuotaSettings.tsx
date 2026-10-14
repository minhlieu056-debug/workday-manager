import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDays } from '../../utils/leaveCalculator';
import {
  Sliders,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  Save,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const QuotaSettings: React.FC = () => {
  const {
    settings,
    updateSystemSettings,
    updateMonthlyQuota,
    currentYear,
    currentMonth,
    quotas,
  } = useApp();

  const [defaultQuota, setDefaultQuota] = useState<number>(settings.default_monthly_quota);
  const [currentMonthQuota, setCurrentMonthQuota] = useState<number>(() => {
    const found = quotas.find((q) => q.year === currentYear && q.month === currentMonth && !q.department);
    return found ? found.quota_days : settings.default_monthly_quota;
  });
  const [countPending, setCountPending] = useState<boolean>(settings.count_pending_as_used);
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(settings.exclude_weekends);
  const [companyName, setCompanyName] = useState<string>(settings.company_name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Save global settings
    await updateSystemSettings({
      default_monthly_quota: Number(defaultQuota),
      count_pending_as_used: countPending,
      exclude_weekends: excludeWeekends,
      company_name: companyName.trim(),
    });

    // Save current month quota
    await updateMonthlyQuota(Number(currentMonthQuota), null);

    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Cấu Hình Công Ty
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Cài Đặt Hạn Mức Nghỉ Phép & Quy Tắc Tính Toán
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập số ngày phép tiêu chuẩn, cấu hình cuối tuần và quy tắc phê duyệt
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Card 1: Default Quota Setting */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              1. Hạn Mức Nghỉ Phép Mặc Định Hàng Tháng
            </h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Hạn mức ngày nghỉ phép tiêu chuẩn áp dụng cho mỗi nhân viên trong 1 tháng (mặc định là{' '}
            <strong>4,5 ngày/tháng</strong> theo quy chế công ty).
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-40">
              <input
                type="number"
                step="0.5"
                min="0"
                max="31"
                required
                value={defaultQuota}
                onChange={(e) => setDefaultQuota(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 text-base font-bold text-blue-700 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                ngày/tháng
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDefaultQuota(4.0)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  defaultQuota === 4.0
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                4,0 ngày
              </button>
              <button
                type="button"
                onClick={() => setDefaultQuota(4.5)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  defaultQuota === 4.5
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                4,5 ngày (Chuẩn)
              </button>
              <button
                type="button"
                onClick={() => setDefaultQuota(5.0)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  defaultQuota === 5.0
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                5,0 ngày
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Mỗi tháng được tính hạn mức riêng biệt, không tự động cộng dồn số ngày chưa nghỉ sang tháng kế tiếp theo đúng quy chế nội bộ.
            </span>
          </div>
        </div>

        {/* Card 2: Specific Quota for Viewed Month */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              2. Hạn Mức Riêng Cho Tháng {currentMonth}/{currentYear}
            </h2>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Cho phép quản trị viên tăng hoặc giảm hạn mức cho các tháng đặc biệt (tháng Tết, nghỉ hè, cao điểm sản xuất...).
          </p>

          <div className="flex items-center gap-3">
            <div className="relative w-40">
              <input
                type="number"
                step="0.5"
                min="0"
                max="31"
                required
                value={currentMonthQuota}
                onChange={(e) => setCurrentMonthQuota(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 text-base font-bold text-indigo-700 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                ngày
              </span>
            </div>
            <span className="text-xs text-slate-500">
              (Áp dụng độc lập cho Tháng {currentMonth}/{currentYear})
            </span>
          </div>
        </div>

        {/* Card 3: Rules & Calculation Toggles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              3. Quy Tắc Tính Toán & Xét Duyệt
            </h2>
          </div>

          {/* Weekend Toggle */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800">
                Loại trừ Thứ Bảy và Chủ Nhật (Cuối tuần)
              </div>
              <p className="text-[11px] text-slate-500">
                Khi bật: Nhân viên không thể đăng ký nghỉ vào T7 & CN; ngày cuối tuần không trừ vào hạn mức phép.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExcludeWeekends(!excludeWeekends)}
              className="text-slate-700 focus:outline-none"
            >
              {excludeWeekends ? (
                <ToggleRight className="w-8 h-8 text-blue-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
            </button>
          </div>

          {/* Pending Requests Toggle */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800">
                Tính cả đơn "Chờ duyệt" vào số ngày đã nghỉ
              </div>
              <p className="text-[11px] text-slate-500">
                Khi tắt (Khuyên dùng): Chỉ đơn có trạng thái <strong>Đã duyệt</strong> mới được trừ vào ngày phép thực tế.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCountPending(!countPending)}
              className="text-slate-700 focus:outline-none"
            >
              {countPending ? (
                <ToggleRight className="w-8 h-8 text-blue-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
            </button>
          </div>

          {/* Company Name */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              Tên tổ chức / công ty
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu cấu hình...' : 'Lưu Thay Đổi Cấu Hình'}
          </button>
        </div>
      </form>
    </div>
  );
};
