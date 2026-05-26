import { format, isValid, getYear, parse, parseISO } from 'date-fns';
import { TZDateMini } from '@date-fns/tz';
import { getCalendars } from 'expo-localization';

export const deviceTimeZone = getCalendars()[0]?.timeZone ?? 'UTC';

const COMMON_DATE_FORMATS = [
  'yyyy-MM-dd HH:mm:ss',
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  "yyyy-MM-dd'T'HH:mm:ssX"
];

export const parseDbTimestamp = (timestamp: string): Date | null => {
  if (!timestamp) return null;
  const hasTimezoneOffset = /Z|[+-]\d{2}:?\d{2}$/.test(timestamp);
  
  let dateStr = timestamp;
  if (!hasTimezoneOffset) {
    dateStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') + 'Z' : dateStr + 'Z';
  }

  let parsedDate = parseISO(dateStr);
  if (isValid(parsedDate)) {
    return new TZDateMini(parsedDate, deviceTimeZone);
  }
  
  for (const formatStr of COMMON_DATE_FORMATS) {
    parsedDate = parse(dateStr, formatStr, new Date());
    if (isValid(parsedDate)) {
      return new TZDateMini(parsedDate, deviceTimeZone);
    }
  }
  
  // Final fallback
  parsedDate = new Date(dateStr);
  return isValid(parsedDate) ? new TZDateMini(parsedDate, deviceTimeZone) : null;
};

/**
 * Safely parses a date and checks for validity.
 * Returns null if the date is invalid.
 */
const getValidDate = (date: Date | string | number | null | undefined): Date | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isValid(date) ? new TZDateMini(date, deviceTimeZone) : null;
  }
  
  if (typeof date === 'number') {
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? new TZDateMini(parsedDate, deviceTimeZone) : null;
  }
  
  if (typeof date === 'string') {
    return parseDbTimestamp(date);
  }
  
  return null;
};

/**
 * Format: "MMMM do yyyy, h:mm a"
 * Example: "August 24th 2026, 10:00 PM"
 */
export const formatDateWithTime = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "MMMM do yyyy, h:mm a");
};

/**
 * Format: "hh:mm a dd/MM/yyyy"
 * Example: "10:00 PM 24/08/2026"
 */
export const formatTimeWithDate = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "hh:mm a dd/MM/yyyy");
};

/**
 * Format: "dd/MM/yyyy"
 * Example: "24/08/2026"
 */
export const formatDateShortYear = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "dd/MM/yyyy");
};

/**
 * Format: "d MMM, EEE, h:mm a"
 * Example: "24 Aug, Mon, 10:00 PM"
 */
export const formatWithOrdinalAndDay = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "d MMM, EEE, h:mm a");
};

/**
 * Format: "dd MMM"
 * Example: "24 Aug"
 */
export const formatDateShort = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "dd MMM");
};

/**
 * Gets the current year.
 * Example: 2026
 */
export const getCurrentYear = (): number => {
  return getYear(new TZDateMini(new Date(), deviceTimeZone));
};
