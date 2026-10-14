import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  isAlert?: boolean;
  progressPercent?: number;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
  isAlert = false,
  progressPercent,
  badge,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-100',
      progress: 'bg-blue-600',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      progress: 'bg-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'border-amber-100',
      progress: 'bg-amber-500',
    },
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-600',
      border: 'border-rose-100',
      progress: 'bg-rose-600',
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'border-purple-100',
      progress: 'bg-purple-600',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      progress: 'bg-slate-600',
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md ${
        isAlert
          ? 'bg-rose-50/50 border-2 border-rose-300 ring-4 ring-rose-50'
          : 'bg-white border border-slate-200/80 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isAlert ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {value}
            </span>
            {badge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isAlert
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${variantStyles.bg} ${variantStyles.text}`}>
          {icon}
        </div>
      </div>

      {progressPercent !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Đã dùng</span>
            <span className="font-semibold text-slate-700">{Math.min(100, Math.round(progressPercent))}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent > 100 ? 'bg-rose-500' : variantStyles.progress
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && (
        <div className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};
