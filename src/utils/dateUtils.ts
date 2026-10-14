/**
 * Utilities for Vietnamese date handling and accurate calendar calculations
 */

export const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
export const VIETNAMESE_DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const VIETNAMESE_MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

/**
 * Format date string or object to DD/MM/YYYY
 */
export function formatDateVN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date with time: DD/MM/YYYY HH:mm
 */
export function formatDateTimeVN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const dateStr = formatDateVN(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Convert Date to YYYY-MM-DD string
 */
export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a year is a leap year (Năm nhuận)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get total number of days in a given month and year
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Returns whether a date string is Saturday or Sunday
 */
export function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Generate calendar grid cells for a given month and year
 * Monday as first day of week (standard in VN enterprise)
 */
export interface CalendarCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayOfWeek: number; // 0-6 (0 is Sunday, 1 is Monday)
}

export function generateCalendarMonth(year: number, month: number): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const todayStr = toISODateString(new Date());

  // First day of current month
  const firstDayOfMonth = new Date(year, month - 1, 1);
  // Total days in month
  const totalDays = getDaysInMonth(year, month);

  // Day of week of first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // For Monday-first grid: Monday = 0, Sunday = 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday is 6th index

  // Previous month trailing days
  const prevMonthTotalDays = getDaysInMonth(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const dayNum = prevMonthTotalDays - i;
    const dateObj = new Date(prevYear, prevMonth - 1, dayNum);
    const dateStr = toISODateString(dateObj);

    cells.push({
      date: dateObj,
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
      dayOfWeek: dateObj.getDay(),
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dateStr = toISODateString(dateObj);

    cells.push({
      date: dateObj,
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
      dayOfWeek: dateObj.getDay(),
    });
  }

  // Next month leading days to complete the 35 or 42 grid cells
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const dateObj = new Date(nextYear, nextMonth - 1, i);
    const dateStr = toISODateString(dateObj);

    cells.push({
      date: dateObj,
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
      dayOfWeek: dateObj.getDay(),
    });
  }

  return cells;
}
