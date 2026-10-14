import { LeaveRequest, Profile, EmployeeMonthlySummary, SystemSettings, MonthlyQuota } from '../types';

/**
 * Format decimal days into Vietnamese format (e.g. 4.5 -> "4,5", 3 -> "3")
 */
export function formatDays(days: number): string {
  if (days === undefined || days === null) return '0';
  const rounded = Math.round(days * 10) / 10;
  return rounded.toString().replace('.', ',');
}

/**
 * Calculate leave summary for a specific employee in a specific month and year
 */
export function calculateEmployeeMonthSummary(
  profile: Profile,
  requests: LeaveRequest[],
  year: number,
  month: number,
  settings: SystemSettings,
  quotas: MonthlyQuota[] = []
): EmployeeMonthlySummary {
  // Determine quota for this month/year/department
  let quota = settings.default_monthly_quota;
  
  // Specific month quota override
  const specificQuota = quotas.find(
    (q) => q.year === year && q.month === month && (!q.department || q.department === profile.department)
  );
  if (specificQuota) {
    quota = specificQuota.quota_days;
  }

  // Filter requests for this employee in this month
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const empRequests = requests.filter(
    (req) => req.employee_id === profile.id && req.date.startsWith(monthPrefix)
  );

  let approvedDays = 0;
  let pendingDays = 0;

  for (const req of empRequests) {
    if (req.status === 'approved') {
      approvedDays += req.duration;
    } else if (req.status === 'pending') {
      pendingDays += req.duration;
    }
    // 'rejected' and 'cancelled' are NEVER counted
  }

  // Used days depending on configuration
  const usedDays = settings.count_pending_as_used 
    ? approvedDays + pendingDays 
    : approvedDays;

  // Round to 1 decimal place to prevent floating point inaccuracies
  const cleanUsedDays = Math.round(usedDays * 10) / 10;
  const cleanQuota = Math.round(quota * 10) / 10;

  const remainingDays = cleanUsedDays < cleanQuota 
    ? Math.round((cleanQuota - cleanUsedDays) * 10) / 10 
    : 0;

  const overDays = cleanUsedDays > cleanQuota 
    ? Math.round((cleanUsedDays - cleanQuota) * 10) / 10 
    : 0;

  const isOverQuota = cleanUsedDays > cleanQuota;

  return {
    profile,
    quota_days: cleanQuota,
    used_days: cleanUsedDays,
    remaining_days: remainingDays,
    over_days: overDays,
    is_over_quota: isOverQuota,
    pending_days: Math.round(pendingDays * 10) / 10,
    approved_days: Math.round(approvedDays * 10) / 10,
    leave_count: empRequests.filter(r => r.status !== 'cancelled' && r.status !== 'rejected').length,
  };
}

/**
 * Calculate company-wide aggregate statistics for a given month and year
 */
export function calculateCompanyMonthStats(
  profiles: Profile[],
  requests: LeaveRequest[],
  year: number,
  month: number,
  settings: SystemSettings,
  quotas: MonthlyQuota[] = []
) {
  const activeProfiles = profiles.filter((p) => !p.is_locked);
  const summaries = activeProfiles.map((p) =>
    calculateEmployeeMonthSummary(p, requests, year, month, settings, quotas)
  );

  const totalEmployees = activeProfiles.length;
  const employeesWithLeave = summaries.filter((s) => s.used_days > 0).length;
  const totalLeaveDays = summaries.reduce((acc, curr) => acc + curr.used_days, 0);
  const overQuotaEmployees = summaries.filter((s) => s.is_over_quota);
  const inQuotaEmployees = summaries.filter((s) => !s.is_over_quota);

  // Month-wide pending requests
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const pendingRequestsCount = requests.filter(
    (req) => req.date.startsWith(monthPrefix) && req.status === 'pending'
  ).length;

  return {
    totalEmployees,
    employeesWithLeave,
    totalLeaveDays: Math.round(totalLeaveDays * 10) / 10,
    inQuotaCount: inQuotaEmployees.length,
    overQuotaCount: overQuotaEmployees.length,
    overQuotaList: overQuotaEmployees,
    pendingRequestsCount,
    summaries,
  };
}
