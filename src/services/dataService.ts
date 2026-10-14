import { getSupabaseClient } from '../lib/supabase';
import {
  Profile,
  LeaveRequest,
  SystemSettings,
  MonthlyQuota,
  AuditLog,
  LeaveStatus,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_MONTHLY_QUOTAS,
  INITIAL_AUDIT_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  PROFILES: 'workday_profiles_v1',
  REQUESTS: 'workday_requests_v1',
  SETTINGS: 'workday_settings_v1',
  QUOTAS: 'workday_quotas_v1',
  LOGS: 'workday_logs_v1',
};

// Local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export const dataService = {
  // ---------------- PROFILES ----------------
  async getProfiles(): Promise<Profile[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('employee_code');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getProfiles fallback to local:', err);
      }
    }
    return getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  async createProfile(profileData: Omit<Profile, 'id' | 'created_at'>): Promise<Profile> {
    const newProfile: Profile = {
      ...profileData,
      id: `emp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').insert([newProfile]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createProfile fallback to local:', err);
      }
    }

    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    profiles.push(newProfile);
    setLocal(STORAGE_KEYS.PROFILES, profiles);
    return newProfile;
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateProfile fallback to local:', err);
      }
    }

    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex((p) => p.id === id);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates };
      setLocal(STORAGE_KEYS.PROFILES, profiles);
      return profiles[index];
    }
    throw new Error('Không tìm thấy nhân viên cần cập nhật');
  },

  async toggleLockProfile(id: string): Promise<Profile> {
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const profile = profiles.find((p) => p.id === id);
    if (!profile) throw new Error('Không tìm thấy nhân viên');
    const updatedLocked = !profile.is_locked;
    return this.updateProfile(id, { is_locked: updatedLocked });
  },

  async deleteProfile(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProfile fallback to local:', err);
      }
    }

    let profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    profiles = profiles.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.PROFILES, profiles);
    return true;
  },

  // ---------------- LEAVE REQUESTS ----------------
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leave_requests')
          .select('*, profiles:employee_id(full_name, employee_code, department)')
          .order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            ...d,
            employee_name: d.profiles?.full_name || '',
            employee_code: d.profiles?.employee_code || '',
            department: d.profiles?.department || '',
          }));
        }
      } catch (err) {
        console.warn('Supabase getLeaveRequests fallback to local:', err);
      }
    }
    return getLocal<LeaveRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_LEAVE_REQUESTS);
  },

  async createLeaveRequest(requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>): Promise<LeaveRequest> {
    const newRequest: LeaveRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('leave_requests').insert([newRequest]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase createLeaveRequest fallback to local:', err);
      }
    }

    const requests = getLocal<LeaveRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_LEAVE_REQUESTS);
    requests.unshift(newRequest);
    setLocal(STORAGE_KEYS.REQUESTS, requests);
    return newRequest;
  },

  async updateLeaveRequestStatus(
    id: string,
    status: LeaveStatus,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<LeaveRequest> {
    const updates: Partial<LeaveRequest> = {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('leave_requests').update(updates).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase updateLeaveRequestStatus fallback to local:', err);
      }
    }

    const requests = getLocal<LeaveRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_LEAVE_REQUESTS);
    const index = requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      setLocal(STORAGE_KEYS.REQUESTS, requests);
      return requests[index];
    }
    throw new Error('Không tìm thấy đơn nghỉ phép');
  },

  async cancelLeaveRequest(id: string, employeeId: string): Promise<LeaveRequest> {
    const requests = getLocal<LeaveRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_LEAVE_REQUESTS);
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Không tìm thấy đơn nghỉ phép');

    const req = requests[index];
    if (req.employee_id !== employeeId) {
      throw new Error('Bạn không có quyền hủy đơn nghỉ của nhân viên khác');
    }
    if (req.status !== 'pending') {
      throw new Error('Chỉ có thể hủy đơn đang ở trạng thái Chờ duyệt');
    }

    requests[index].status = 'cancelled';
    setLocal(STORAGE_KEYS.REQUESTS, requests);
    return requests[index];
  },

  // ---------------- SYSTEM SETTINGS ----------------
  async getSystemSettings(): Promise<SystemSettings> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('system_settings').select('*').limit(1).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getSystemSettings fallback to local:', err);
      }
    }
    return getLocal<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS);
  },

  async updateSystemSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = getLocal<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS);
    const updated = { ...current, ...newSettings };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('system_settings').upsert({ id: 'main_settings', ...updated });
      } catch (err) {
        console.warn('Supabase updateSystemSettings fallback to local:', err);
      }
    }

    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // ---------------- MONTHLY QUOTAS ----------------
  async getMonthlyQuotas(): Promise<MonthlyQuota[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('monthly_quotas').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getMonthlyQuotas fallback to local:', err);
      }
    }
    return getLocal<MonthlyQuota[]>(STORAGE_KEYS.QUOTAS, INITIAL_MONTHLY_QUOTAS);
  },

  async setMonthlyQuota(year: number, month: number, quotaDays: number, department?: string | null): Promise<MonthlyQuota> {
    const quotas = getLocal<MonthlyQuota[]>(STORAGE_KEYS.QUOTAS, INITIAL_MONTHLY_QUOTAS);
    const existingIndex = quotas.findIndex(
      (q) => q.year === year && q.month === month && (q.department || null) === (department || null)
    );

    let updatedItem: MonthlyQuota;
    if (existingIndex !== -1) {
      quotas[existingIndex].quota_days = quotaDays;
      updatedItem = quotas[existingIndex];
    } else {
      updatedItem = {
        id: `quota-${year}-${month}-${Date.now()}`,
        year,
        month,
        department: department || null,
        quota_days: quotaDays,
      };
      quotas.push(updatedItem);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('monthly_quotas').upsert(updatedItem);
      } catch (err) {
        console.warn('Supabase setMonthlyQuota fallback to local:', err);
      }
    }

    setLocal(STORAGE_KEYS.QUOTAS, quotas);
    return updatedItem;
  },

  // ---------------- AUDIT LOGS ----------------
  async getAuditLogs(): Promise<AuditLog[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getAuditLogs fallback to local:', err);
      }
    }
    return getLocal<AuditLog[]>(STORAGE_KEYS.LOGS, INITIAL_AUDIT_LOGS);
  },

  async addAuditLog(userId: string, userName: string, action: string, details: string): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      action,
      details,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('audit_logs').insert([newLog]);
      } catch (err) {
        console.warn('Supabase addAuditLog fallback to local:', err);
      }
    }

    const logs = getLocal<AuditLog[]>(STORAGE_KEYS.LOGS, INITIAL_AUDIT_LOGS);
    logs.unshift(newLog);
    setLocal(STORAGE_KEYS.LOGS, logs.slice(0, 100)); // keep last 100
    return newLog;
  },

  // Reset to initial demo data
  resetDemoData(): void {
    setLocal(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    setLocal(STORAGE_KEYS.REQUESTS, INITIAL_LEAVE_REQUESTS);
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SYSTEM_SETTINGS);
    setLocal(STORAGE_KEYS.QUOTAS, INITIAL_MONTHLY_QUOTAS);
    setLocal(STORAGE_KEYS.LOGS, INITIAL_AUDIT_LOGS);
  },
};
