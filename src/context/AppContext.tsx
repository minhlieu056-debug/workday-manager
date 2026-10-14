import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Profile,
  LeaveRequest,
  MonthlyQuota,
  SystemSettings,
  AuditLog,
  EmployeeMonthlySummary,
  LeaveType,
} from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from './AuthContext';
import {
  calculateEmployeeMonthSummary,
  calculateCompanyMonthStats,
} from '../utils/leaveCalculator';
import confetti from 'canvas-confetti';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & Date
  currentYear: number;
  currentMonth: number;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToTodayMonth: () => void;

  // Data
  profiles: Profile[];
  requests: LeaveRequest[];
  quotas: MonthlyQuota[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  isLoading: boolean;

  // Computed
  personalSummary: EmployeeMonthlySummary | null;
  companyStats: ReturnType<typeof calculateCompanyMonthStats>;
  myRequestsThisMonth: LeaveRequest[];
  myAllRequests: LeaveRequest[];

  // Actions
  refreshData: () => Promise<void>;
  registerLeave: (data: {
    date: string;
    leave_type: LeaveType;
    reason: string;
    notes?: string;
  }) => Promise<{ success: boolean; message: string }>;
  cancelLeave: (requestId: string) => Promise<{ success: boolean; message: string }>;
  approveLeave: (requestId: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  rejectLeave: (requestId: string, notes?: string) => Promise<{ success: boolean; message: string }>;

  // Admin Actions
  createProfile: (profile: Omit<Profile, 'id' | 'created_at'>) => Promise<{ success: boolean; message: string }>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<{ success: boolean; message: string }>;
  toggleLockProfile: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteProfile: (id: string) => Promise<{ success: boolean; message: string }>;
  updateSystemSettings: (updates: Partial<SystemSettings>) => Promise<{ success: boolean; message: string }>;
  updateMonthlyQuota: (quotaDays: number, department?: string | null) => Promise<{ success: boolean; message: string }>;
  resetDemoData: () => Promise<void>;

  // Toasts
  toasts: ToastInfo[];
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, refreshCurrentUser } = useAuth();

  // Reference year & month (Defaulting to October 2026 as per prompt specifications)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Core entities
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [quotas, setQuotas] = useState<MonthlyQuota[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    default_monthly_quota: 4.5,
    count_pending_as_used: false,
    exclude_weekends: true,
    company_name: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ WORKDAY',
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all initial data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedProfiles, fetchedRequests, fetchedQuotas, fetchedSettings, fetchedLogs] = await Promise.all([
        dataService.getProfiles(),
        dataService.getLeaveRequests(),
        dataService.getMonthlyQuotas(),
        dataService.getSystemSettings(),
        dataService.getAuditLogs(),
      ]);

      setProfiles(fetchedProfiles);
      setRequests(fetchedRequests);
      setQuotas(fetchedQuotas);
      setSettings(fetchedSettings);
      setAuditLogs(fetchedLogs);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('error', 'Không thể tải dữ liệu từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Month navigation helpers
  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const goToTodayMonth = useCallback(() => {
    // Current target demo month is October 2026
    setCurrentYear(2026);
    setCurrentMonth(10);
  }, []);

  // Computed Personal Summary
  const personalSummary = useMemo(() => {
    if (!currentUser) return null;
    return calculateEmployeeMonthSummary(
      currentUser,
      requests,
      currentYear,
      currentMonth,
      settings,
      quotas
    );
  }, [currentUser, requests, currentYear, currentMonth, settings, quotas]);

  // Computed Company Statistics
  const companyStats = useMemo(() => {
    return calculateCompanyMonthStats(
      profiles,
      requests,
      currentYear,
      currentMonth,
      settings,
      quotas
    );
  }, [profiles, requests, currentYear, currentMonth, settings, quotas]);

  // Filtered requests for current user
  const myAllRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter((r) => r.employee_id === currentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentUser, requests]);

  const myRequestsThisMonth = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    return myAllRequests.filter((r) => r.date.startsWith(monthPrefix));
  }, [myAllRequests, currentYear, currentMonth]);

  // Register Leave Request
  const registerLeave = async (data: {
    date: string;
    leave_type: LeaveType;
    reason: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập để đăng ký nghỉ phép.' };
    }

    if (currentUser.is_locked) {
      return { success: false, message: 'Tài khoản của bạn đang bị khóa.' };
    }

    // Check weekend rule
    if (settings.exclude_weekends) {
      const d = new Date(data.date);
      const day = d.getDay();
      if (day === 0 || day === 6) {
        return {
          success: false,
          message: 'Quy định công ty không tính ngày nghỉ vào Thứ Bảy và Chủ Nhật.',
        };
      }
    }

    // Check duplicate date
    const existing = requests.find(
      (r) =>
        r.employee_id === currentUser.id &&
        r.date === data.date &&
        r.status !== 'cancelled' &&
        r.status !== 'rejected'
    );

    if (existing) {
      if (existing.leave_type === 'full') {
        return { success: false, message: `Bạn đã có đơn nghỉ cả ngày vào ngày ${data.date}.` };
      }
      if (existing.leave_type === data.leave_type) {
        return {
          success: false,
          message: `Bạn đã đăng ký buổi này vào ngày ${data.date}.`,
        };
      }
    }

    const duration = data.leave_type === 'full' ? 1.0 : 0.5;

    try {
      const created = await dataService.createLeaveRequest({
        employee_id: currentUser.id,
        employee_name: currentUser.full_name,
        employee_code: currentUser.employee_code,
        department: currentUser.department,
        date: data.date,
        leave_type: data.leave_type,
        duration,
        reason: data.reason,
        notes: data.notes,
      });

      setRequests((prev) => [created, ...prev]);

      await dataService.addAuditLog(
        currentUser.id,
        currentUser.full_name,
        'Đăng ký nghỉ phép',
        `Đăng ký ${duration} ngày nghỉ vào ngày ${data.date} (${data.reason})`
      );

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore in test environments
      }

      showToast('success', 'Đã gửi đơn đăng ký nghỉ phép thành công!');
      return { success: true, message: 'Đăng ký thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi tạo đơn nghỉ phép';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  // Cancel own leave request
  const cancelLeave = async (requestId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };

    try {
      await dataService.cancelLeaveRequest(requestId, currentUser.id);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r))
      );

      await dataService.addAuditLog(
        currentUser.id,
        currentUser.full_name,
        'Hủy đơn nghỉ',
        `Hủy đơn nghỉ mã số #${requestId}`
      );

      showToast('info', 'Đã hủy đơn đăng ký nghỉ phép thành công.');
      return { success: true, message: 'Đã hủy đơn' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi hủy đơn';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  // Approve leave request (Manager / Admin)
  const approveLeave = async (
    requestId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };

    try {
      const updated = await dataService.updateLeaveRequestStatus(
        requestId,
        'approved',
        currentUser.id,
        notes
      );

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

      await dataService.addAuditLog(
        currentUser.id,
        currentUser.full_name,
        'Duyệt đơn nghỉ phép',
        `Phê duyệt đơn nghỉ #${requestId}${notes ? ` (Ghi chú: ${notes})` : ''}`
      );

      showToast('success', 'Đã phê duyệt đơn nghỉ phép.');
      return { success: true, message: 'Đã duyệt thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi duyệt đơn';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  // Reject leave request (Manager / Admin)
  const rejectLeave = async (
    requestId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };

    try {
      const updated = await dataService.updateLeaveRequestStatus(
        requestId,
        'rejected',
        currentUser.id,
        notes
      );

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

      await dataService.addAuditLog(
        currentUser.id,
        currentUser.full_name,
        'Từ chối đơn nghỉ phép',
        `Từ chối đơn nghỉ #${requestId}${notes ? ` (Lý do: ${notes})` : ''}`
      );

      showToast('warning', 'Đã từ chối đơn nghỉ phép.');
      return { success: true, message: 'Đã từ chối' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi từ chối đơn';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  // Profile operations
  const createProfile = async (
    profileData: Omit<Profile, 'id' | 'created_at'>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const created = await dataService.createProfile(profileData);
      setProfiles((prev) => [...prev, created]);

      if (currentUser) {
        await dataService.addAuditLog(
          currentUser.id,
          currentUser.full_name,
          'Thêm nhân viên mới',
          `Tạo hồ sơ cho ${created.full_name} (${created.employee_code}) - Phòng ${created.department}`
        );
      }

      showToast('success', `Đã thêm nhân viên ${created.full_name} thành công!`);
      return { success: true, message: 'Thêm nhân viên thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi tạo nhân viên';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const updateProfile = async (
    id: string,
    updates: Partial<Profile>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = await dataService.updateProfile(id, updates);
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      refreshCurrentUser();

      if (currentUser) {
        await dataService.addAuditLog(
          currentUser.id,
          currentUser.full_name,
          'Cập nhật nhân viên',
          `Cập nhật hồ sơ nhân viên ${updated.full_name} (${updated.employee_code})`
        );
      }

      showToast('success', 'Đã cập nhật thông tin nhân viên.');
      return { success: true, message: 'Cập nhật thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi cập nhật';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const toggleLockProfile = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = await dataService.toggleLockProfile(id);
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));

      const actionText = updated.is_locked ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
      if (currentUser) {
        await dataService.addAuditLog(
          currentUser.id,
          currentUser.full_name,
          actionText,
          `${actionText} của nhân viên ${updated.full_name} (${updated.employee_code})`
        );
      }

      showToast('info', `Đã ${actionText.toLowerCase()} ${updated.full_name}.`);
      return { success: true, message: 'Thao tác thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi thao tác';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const deleteProfile = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const target = profiles.find((p) => p.id === id);
      await dataService.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));

      if (currentUser && target) {
        await dataService.addAuditLog(
          currentUser.id,
          currentUser.full_name,
          'Xóa nhân viên',
          `Xóa nhân viên ${target.full_name} (${target.employee_code}) khỏi hệ thống`
        );
      }

      showToast('info', 'Đã xóa nhân viên khỏi hệ thống.');
      return { success: true, message: 'Xóa thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi xóa nhân viên';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  // Quota & Settings operations
  const updateSystemSettings = async (
    updates: Partial<SystemSettings>
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = await dataService.updateSystemSettings(updates);
      setSettings(updated);

      if (currentUser) {
        await dataService.addAuditLog(
          currentUser.id,
          currentUser.full_name,
          'Cập nhật cài đặt hệ thống',
          `Hạn mức mặc định: ${updated.default_monthly_quota} ngày | Tính cả đơn chờ: ${updated.count_pending_as_used}`
        );
      }

      showToast('success', 'Đã lưu cài đặt hệ thống thành công.');
      return { success: true, message: 'Cập nhật thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi lưu cài đặt';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const updateMonthlyQuota = async (
    quotaDays: number,
    department?: string | null
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const updated = await dataService.setMonthlyQuota(
        currentYear,
        currentMonth,
        quotaDays,
        department
      );
      setQuotas((prev) => {
        const idx = prev.findIndex((q) => q.id === updated.id);
        if (idx !== -1) {
          const clone = [...prev];
          clone[idx] = updated;
          return clone;
        }
        return [...prev, updated];
      });

      if (currentUser) {
        await dataService.addAuditLog(
          currentUser.id,
          currentUser.full_name,
          'Điều chỉnh hạn mức tháng',
          `Hạn mức Tháng ${currentMonth}/${currentYear}: ${quotaDays} ngày${
            department ? ` (${department})` : ' (Toàn công ty)'
          }`
        );
      }

      showToast('success', `Đã cập nhật hạn mức Tháng ${currentMonth}/${currentYear} thành ${quotaDays} ngày.`);
      return { success: true, message: 'Cập nhật hạn mức thành công' };
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi cập nhật hạn mức';
      showToast('error', msg);
      return { success: false, message: msg };
    }
  };

  const resetDemoData = async () => {
    dataService.resetDemoData();
    await refreshData();
    showToast('info', 'Đã đặt lại dữ liệu mẫu gốc ban đầu.');
  };

  return (
    <AppContext.Provider
      value={{
        currentYear,
        currentMonth,
        selectedDate,
        setSelectedDate,
        setMonth: setCurrentMonth,
        setYear: setCurrentYear,
        nextMonth,
        prevMonth,
        goToTodayMonth,
        profiles,
        requests,
        quotas,
        settings,
        auditLogs,
        isLoading,
        personalSummary,
        companyStats,
        myRequestsThisMonth,
        myAllRequests,
        refreshData,
        registerLeave,
        cancelLeave,
        approveLeave,
        rejectLeave,
        createProfile,
        updateProfile,
        toggleLockProfile,
        deleteProfile,
        updateSystemSettings,
        updateMonthlyQuota,
        resetDemoData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
