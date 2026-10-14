import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  currentUser: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (profileId: string) => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<{ success: boolean; message: string }>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const profiles = await dataService.getProfiles();
        const savedUserId = localStorage.getItem('workday_active_user_id');

        if (savedUserId) {
          const found = profiles.find((p) => p.id === savedUserId);
          if (found && !found.is_locked) {
            setCurrentUser(found);
            setIsLoading(false);
            return;
          }
        }

        // Default to Nguyễn Văn A (NV001) for immediate demo experience if no saved user
        const defaultUser = profiles.find((p) => p.employee_code === 'NV001') || profiles[0];
        if (defaultUser && !defaultUser.is_locked) {
          setCurrentUser(defaultUser);
          localStorage.setItem('workday_active_user_id', defaultUser.id);
        }
      } catch (err) {
        console.error('Failed to init auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const profiles = await dataService.getProfiles();
      const user = profiles.find((p) => p.email.toLowerCase().trim() === email.toLowerCase().trim());

      if (!user) {
        return { success: false, message: 'Email đăng nhập không tồn tại trong hệ thống.' };
      }

      if (user.is_locked) {
        return {
          success: false,
          message: 'Tài khoản này đã bị KHÓA bởi Quản trị viên. Vui lòng liên hệ Phòng Nhân sự hoặc Ban Giám Đốc.',
        };
      }

      // Check simple password rule for demo: password should not be empty, or matches standard format
      if (password !== undefined && password.trim().length === 0) {
        return { success: false, message: 'Vui lòng nhập mật khẩu.' };
      }

      setCurrentUser(user);
      localStorage.setItem('workday_active_user_id', user.id);
      
      await dataService.addAuditLog(user.id, user.full_name, 'Đăng nhập', `Đăng nhập thành công với vai trò ${user.role}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi khi đăng nhập' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (currentUser) {
      dataService.addAuditLog(currentUser.id, currentUser.full_name, 'Đăng xuất', 'Đăng xuất khỏi hệ thống');
    }
    setCurrentUser(null);
    localStorage.removeItem('workday_active_user_id');
  };

  const switchUser = async (profileId: string) => {
    setIsLoading(true);
    try {
      const profiles = await dataService.getProfiles();
      const target = profiles.find((p) => p.id === profileId);
      if (target) {
        if (target.is_locked) {
          alert('Tài khoản này đang bị khóa, không thể chuyển sang!');
          return;
        }
        setCurrentUser(target);
        localStorage.setItem('workday_active_user_id', target.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordRequest = async (email: string): Promise<{ success: boolean; message: string }> => {
    const profiles = await dataService.getProfiles();
    const user = profiles.find((p) => p.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản với email này.' };
    }

    await dataService.addAuditLog(
      user.id,
      user.full_name,
      'Yêu cầu đặt lại mật khẩu',
      `Gửi link đặt lại mật khẩu về email ${email}`
    );

    return {
      success: true,
      message: `Đã gửi liên kết khôi phục mật khẩu đến email ${email}. Vui lòng kiểm tra hộp thư đến (và thư mục rác).`,
    };
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    const profiles = await dataService.getProfiles();
    const updated = profiles.find((p) => p.id === currentUser.id);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin,
        isManager,
        isLoading,
        login,
        logout,
        switchUser,
        resetPasswordRequest,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
