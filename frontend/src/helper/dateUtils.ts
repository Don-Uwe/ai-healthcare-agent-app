import { format, isValid, getYear, parse, parseISO } from 'date-fns';

const COMMON_DATE_FORMATS = [
  'yyyy-MM-dd HH:mm:ss',
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  "yyyy-MM-dd'T'HH:mm:ssX"
];

/**
 * Safely parses a date and checks for validity.
 * Returns null if the date is invalid.
 */
const getValidDate = (date: Date | string | number | null | undefined): Date | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }
  
  if (typeof date === 'number') {
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? parsedDate : null;
  }
  
  if (typeof date === 'string') {
    let parsedDate = parseISO(date);
    if (isValid(parsedDate)) {
      return parsedDate;
    }
    
    for (const formatStr of COMMON_DATE_FORMATS) {
      parsedDate = parse(date, formatStr, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
    
    // Final fallback
    parsedDate = new Date(date);
    return isValid(parsedDate) ? parsedDate : null;
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
  return getYear(new Date());
};
