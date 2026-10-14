import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Database,
  LogOut,
  UserCheck,
  Menu,
  Shield,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { SupabaseConfigModal } from '../setup/SupabaseConfigModal';
import { getSupabaseCredentials } from '../../lib/supabase';
import { VIETNAMESE_MONTHS } from '../../utils/dateUtils';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenResetPassword: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenResetPassword,
}) => {
  const { currentUser, logout, switchUser } = useAuth();
  const {
    currentYear,
    currentMonth,
    nextMonth,
    prevMonth,
    goToTodayMonth,
    profiles,
    resetDemoData,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { isConfigured } = getSupabaseCredentials();

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Admin</span>;
      case 'manager':
        return <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Quản lý</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">Nhân viên</span>;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-xl hover:bg-slate-100 focus:outline-none"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Workday Manager
              </span>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Hệ Thống Quản Lý Ngày Nghỉ Phép
              </span>
            </div>
          </div>

          {/* Center: Month/Year Navigator */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
            <button
              onClick={prevMonth}
              title="Tháng trước"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-xl shadow-xs border border-slate-200/50">
              <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
                {VIETNAMESE_MONTHS[currentMonth - 1]}, {currentYear}
              </span>
            </div>

            <button
              onClick={nextMonth}
              title="Tháng sau"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={goToTodayMonth}
              className="hidden md:inline-flex px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
            >
              T10/2026
            </button>
          </div>

          {/* Right: DB Status & User Avatar */}
          <div className="flex items-center gap-3">
            {/* Database indicator */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Nhấp để cấu hình cơ sở dữ liệu Supabase"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                }`}
              />
              <Database className="w-3.5 h-3.5" />
              <span>{isConfigured ? 'Supabase Online' : 'Database Cục Bộ'}</span>
            </button>

            {/* User Profile Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
              >
                <img
                  src={
                    currentUser?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      currentUser?.full_name || 'User'
                    )}&background=2563eb&color=fff`
                  }
                  alt={currentUser?.full_name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser?.full_name}
                    </span>
                    {currentUser && getRoleBadge(currentUser.role)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {currentUser?.employee_code} • {currentUser?.department}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-medium">Mã: {currentUser?.employee_code}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">{currentUser?.position}</span>
                    </div>
                  </div>

                  {/* Fast Profile Switcher for Testing / Pair Programming */}
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Chuyển nhanh tài khoản thử nghiệm
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {profiles.map((p) => {
                        const isCurrent = p.id === currentUser?.id;
                        return (
                          <button
                            key={p.id}
                            disabled={p.is_locked}
                            onClick={() => {
                              switchUser(p.id);
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                              isCurrent
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : p.is_locked
                                ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-[10px] font-bold text-slate-500">{p.employee_code}</span>
                              <span className="truncate">{p.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {p.is_locked ? (
                                <span className="text-[9px] bg-rose-100 text-rose-600 px-1 py-0.2 rounded">Khóa</span>
                              ) : (
                                getRoleBadge(p.role)
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings & Reset */}
                  <div className="px-2 py-1 border-b border-slate-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsDbModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <Database className="w-4 h-4 text-blue-500" />
                      Cấu hình cơ sở dữ liệu Supabase
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenResetPassword();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      Đặt lại mật khẩu
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Khôi phục dữ liệu mẫu ban đầu về Tháng 10/2026?')) {
                          resetDemoData();
                          setIsUserMenuOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      Đặt lại dữ liệu mẫu gốc
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="px-2 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Database Modal */}
      <SupabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </>
  );
};
