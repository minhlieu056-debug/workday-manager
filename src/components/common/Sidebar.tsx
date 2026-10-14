import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Users,
  CheckSquare,
  FileSpreadsheet,
  Sliders,
  FileText,
  PlusCircle,
  X,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'calendar'
  | 'history'
  | 'admin_dashboard'
  | 'approvals'
  | 'employees'
  | 'monthly_report'
  | 'quotas'
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenLeaveModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile,
  onOpenLeaveModal,
}) => {
  const { isManager, isAdmin, currentUser } = useAuth();
  const { companyStats, personalSummary } = useApp();

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navItemClass = (tab: ActiveTab) => {
    const isActive = activeTab === tab;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Navigation */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Logo & Close on mobile */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                  Workday
                </h1>
                <p className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">
                  Leave System
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action: Register Leave */}
          <div>
            <button
              onClick={() => {
                onOpenLeaveModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Đăng Ký Nghỉ Phép
            </button>
          </div>

          {/* Personal Navigation */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Cá Nhân
            </span>

            <button
              onClick={() => handleNavClick('dashboard')}
              className={navItemClass('dashboard')}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Tổng quan cá nhân</span>
              </div>
              {personalSummary?.is_over_quota && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('calendar')}
              className={navItemClass('calendar')}
            >
              <div className="flex items-center gap-3">
                <CalendarDays className="w-4 h-4" />
                <span>Lịch nghỉ tháng</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('history')}
              className={navItemClass('history')}
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4" />
                <span>Lịch sử đăng ký</span>
              </div>
            </button>
          </div>

          {/* Management Navigation (Admins & Managers) */}
          {isManager && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Quản Trị & Báo Cáo
              </span>

              <button
                onClick={() => handleNavClick('admin_dashboard')}
                className={navItemClass('admin_dashboard')}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tổng quan công ty</span>
                </div>
                {companyStats.overQuotaCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                    {companyStats.overQuotaCount} vượt
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('approvals')}
                className={navItemClass('approvals')}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4" />
                  <span>Duyệt đơn nghỉ</span>
                </div>
                {companyStats.pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                    {companyStats.pendingRequestsCount} chờ
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('employees')}
                className={navItemClass('employees')}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Quản lý nhân viên</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('monthly_report')}
                className={navItemClass('monthly_report')}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Báo cáo tháng & Excel</span>
                </div>
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => handleNavClick('quotas')}
                    className={navItemClass('quotas')}
                  >
                    <div className="flex items-center gap-3">
                      <Sliders className="w-4 h-4" />
                      <span>Cài đặt hạn mức</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('audit')}
                    className={navItemClass('audit')}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <span>Nhật ký hệ thống</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom: User Card snippet */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={
                currentUser?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  currentUser?.full_name || 'NV'
                )}&background=2563eb&color=fff`
              }
              alt=""
              className="w-8 h-8 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.full_name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {currentUser?.department}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
