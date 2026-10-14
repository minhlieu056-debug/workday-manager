export type UserRole = 'admin' | 'manager' | 'employee';

export type LeaveType = 'full' | 'half_am' | 'half_pm';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Profile {
  id: string;
  employee_code: string; // e.g. NV001
  full_name: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  is_locked: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  department?: string;
  date: string; // YYYY-MM-DD
  leave_type: LeaveType;
  duration: number; // 1.0 or 0.5
  reason: string;
  notes?: string;
  status: LeaveStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

export interface MonthlyQuota {
  id: string;
  year: number;
  month: number; // 1-12
  department?: string | null; // null = all
  quota_days: number;
}

export interface SystemSettings {
  default_monthly_quota: number; // default 4.5
  count_pending_as_used: boolean; // false = only approved, true = approved + pending
  exclude_weekends: boolean; // true = Saturday & Sunday cannot be registered
  company_name: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}

export interface EmployeeMonthlySummary {
  profile: Profile;
  quota_days: number;
  used_days: number;
  remaining_days: number;
  over_days: number;
  is_over_quota: boolean;
  pending_days: number;
  approved_days: number;
  leave_count: number;
}
