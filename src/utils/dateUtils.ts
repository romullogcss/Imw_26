/**
 * Utility functions for date manipulation, formatting, and validation.
 * Storage format: YYYY-MM-DD
 * Display format: DD-MM-YYYY
 */

import { ScheduleItem } from '../types';

export const CANONICAL_WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

/**
 * Returns index for day of the week starting with Sunday = 0, Monday = 1 ... Saturday = 6.
 * Returns 99 if unknown.
 */
export function getWeekdayIndex(dayStr?: string | null): number {
  if (!dayStr) return 99;
  const normalized = String(dayStr)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('dom')) return 0;
  if (normalized.includes('seg')) return 1;
  if (normalized.includes('ter')) return 2;
  if (normalized.includes('qua')) return 3;
  if (normalized.includes('qui')) return 4;
  if (normalized.includes('sex')) return 5;
  if (normalized.includes('sab')) return 6;

  return 99;
}

/**
 * Normalizes any day of week string variation into its canonical portuguese display name
 * starting with Sunday ("Domingo").
 */
export function normalizeDayName(dayStr?: string | null): ScheduleItem['day'] {
  const idx = getWeekdayIndex(dayStr);
  if (idx >= 0 && idx <= 6) {
    return CANONICAL_WEEKDAYS[idx] as ScheduleItem['day'];
  }
  return (dayStr as ScheduleItem['day']) || 'Domingo';
}

/**
 * Sorts local church programming (schedules) strictly by day of week starting on Sunday (0)
 * through Saturday (6), then by start time, title, and ID.
 */
export function sortSchedules(schedules: ScheduleItem[]): ScheduleItem[];
export function sortSchedules<T extends { day: string; time?: string; title?: string; id?: string }>(schedules: T[]): T[];
export function sortSchedules<T extends { day: string; time?: string; title?: string; id?: string }>(
  schedules: T[]
): T[] {
  if (!Array.isArray(schedules)) return [];
  return [...schedules].sort((a, b) => {
    // 1. Day of week index (0 = Domingo ... 6 = Sábado)
    const dayA = getWeekdayIndex(a.day);
    const dayB = getWeekdayIndex(b.day);
    if (dayA !== dayB) {
      return dayA - dayB;
    }

    // 2. Start time (e.g. "08:00", "09:00", "18:00", "19:30")
    const timeA = (a.time || '').trim().padStart(5, '0');
    const timeB = (b.time || '').trim().padStart(5, '0');
    if (timeA !== timeB) {
      return timeA.localeCompare(timeB);
    }

    // 3. Title as tie-breaker
    const titleA = a.title || '';
    const titleB = b.title || '';
    if (titleA !== titleB) {
      return titleA.localeCompare(titleB, 'pt-BR');
    }

    // 4. ID as secondary tie-breaker
    return (a.id || '').localeCompare(b.id || '');
  });
}

// Format Date or ISO/YYYY-MM-DD string to DD-MM-YYYY display format
export function formatDateToDisplay(dateValue?: string | Date | null): string {
  if (!dateValue) return '';

  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return '';
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = String(dateValue).trim();
  if (!str) return '';

  // Match YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
  }

  // Match DD-MM-YYYY or DD/MM/YYYY
  const brMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
  }

  // Fallback Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return str;
}

const PORTUGUESE_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Formats a single event date or date range for display in public listings and CMS previews.
 * Examples:
 * - Single date: "15 de Novembro de 2026"
 * - Multi-day same month: "15 a 17 de Novembro de 2026"
 * - Multi-day different months: "30 de Outubro a 02 de Novembro de 2026"
 */
export function formatEventDateRange(startDateStr?: string | null, endDateStr?: string | null): string {
  if (!startDateStr || !startDateStr.trim()) return '';
  const sTrim = startDateStr.trim();
  const eTrim = endDateStr ? endDateStr.trim() : '';

  // If start date is already a pre-formatted text string (e.g. contains ' a ' or ' de ') and no endDate given
  if (!eTrim && (sTrim.toLowerCase().includes(' a ') || sTrim.toLowerCase().includes(' de '))) {
    return sTrim;
  }

  const startD = parseLocalDate(sTrim);
  const endD = eTrim ? parseLocalDate(eTrim) : null;

  if (startD && !isNaN(startD.getTime())) {
    const sDay = String(startD.getDate()).padStart(2, '0');
    const sMonth = PORTUGUESE_MONTHS[startD.getMonth()];
    const sYear = startD.getFullYear();

    if (endD && !isNaN(endD.getTime())) {
      const eDay = String(endD.getDate()).padStart(2, '0');
      const eMonth = PORTUGUESE_MONTHS[endD.getMonth()];
      const eYear = endD.getFullYear();

      // Same day
      if (sDay === eDay && startD.getMonth() === endD.getMonth() && sYear === eYear) {
        return `${sDay} de ${sMonth} de ${sYear}`;
      }
      // Same month and year
      if (startD.getMonth() === endD.getMonth() && sYear === eYear) {
        return `${sDay} a ${eDay} de ${sMonth} de ${sYear}`;
      }
      // Same year, different months
      if (sYear === eYear) {
        return `${sDay} de ${sMonth} a ${eDay} de ${eMonth} de ${sYear}`;
      }
      // Different years
      return `${sDay} de ${sMonth} de ${sYear} a ${eDay} de ${eMonth} de ${eYear}`;
    }

    return `${sDay} de ${sMonth} de ${sYear}`;
  }

  // Fallback if not a standard date format
  if (eTrim) {
    return `${sTrim} a ${eTrim}`;
  }
  return sTrim;
}

// Convert DD-MM-YYYY, Date, or ISO string to YYYY-MM-DD for database storage
export function formatDateToDb(dateValue?: string | Date | null): string {
  if (!dateValue) return '';

  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return '';
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${year}-${month}-${day}`;
  }

  const str = String(dateValue).trim();
  if (!str) return '';

  // Match YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // Match DD-MM-YYYY or DD/MM/YYYY
  const brMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return str;
}

// Format timestamp or ISO string to display DD-MM-YYYY HH:mm
export function formatDateTimeToDisplay(dateValue?: string | Date | null): string {
  if (!dateValue) return '';
  const parsed = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(parsed.getTime())) return String(dateValue);

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} às ${hours}:${minutes}`;
}

// Parse string (YYYY-MM-DD or DD-MM-YYYY) into a local Date without UTC offset shift
export function parseLocalDate(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const str = dateStr.trim();

  // YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }

  // DD-MM-YYYY
  const brMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Validate if DD-MM-YYYY or YYYY-MM-DD is a valid real date
export function isValidDateStr(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = parseLocalDate(dateStr);
  if (!d || isNaN(d.getTime())) return false;
  return true;
}

// Check if date is in the future
export function isFutureDate(dateStr: string): boolean {
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() > today.getTime();
}

// Calculate Google Calendar URL for an event with date (YYYY-MM-DD) and time (HH:mm)
export function generateGoogleCalendarUrl(params: {
  title: string;
  dateStr: string; // YYYY-MM-DD or DD-MM-YYYY
  timeStr?: string; // HH:mm or HH:mm - HH:mm
  location?: string;
  description?: string;
}): string {
  const { title, dateStr, timeStr = '18:00', location = '', description = '' } = params;

  let localDate = parseLocalDate(dateStr);
  if (!localDate) {
    localDate = new Date();
  }

  // Extract start and end times
  let startHour = 18;
  let startMin = 0;
  let endHour = 20;
  let endMin = 0;

  if (timeStr) {
    const times = timeStr.split('-').map((t) => t.trim());
    if (times[0]) {
      const match = times[0].match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        startHour = parseInt(match[1], 10);
        startMin = parseInt(match[2], 10);
      }
    }
    if (times[1]) {
      const match = times[1].match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        endHour = parseInt(match[1], 10);
        endMin = parseInt(match[2], 10);
      }
    } else {
      endHour = Math.min(startHour + 2, 23);
      endMin = startMin;
    }
  }

  const startDate = new Date(localDate);
  startDate.setHours(startHour, startMin, 0, 0);

  const endDate = new Date(localDate);
  endDate.setHours(endHour, endMin, 0, 0);

  const formatGCalUTC = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${formatGCalUTC(startDate)}/${formatGCalUTC(
    endDate
  )}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
}
