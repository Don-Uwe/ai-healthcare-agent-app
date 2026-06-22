import { format, isValid, getYear, parse, parseISO } from 'date-fns';
import { enUS, es, fr, de, hi } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { TZDateMini } from '@date-fns/tz';
import { getCalendars, getLocales } from 'expo-localization';

export const deviceTimeZone = getCalendars()[0]?.timeZone ?? 'UTC';
export const deviceLocale = getLocales()[0]?.languageTag ?? 'en-US';

const localeMap: Record<string, Locale> = {
  'en-US': enUS,
  'en': enUS,
  'es-ES': es,
  'es': es,
  'fr-FR': fr,
  'fr': fr,
  'de-DE': de,
  'de': de,
  'hi-IN': hi,
  'hi': hi,
};

const getActiveLocale = (localeTag: string): Locale => {
  if (localeMap[localeTag]) {
    return localeMap[localeTag];
  }
  const primaryLang = localeTag.split('-')[0];
  if (localeMap[primaryLang]) {
    return localeMap[primaryLang];
  }
  return enUS;
};

const activeLocale = getActiveLocale(deviceLocale);

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
  // If the backend timestamp has no timezone offset, we parse it as local time 
  // to align with Moment.js's original behavior.
  if (!hasTimezoneOffset) {
    dateStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
  }

  let parsedDate = parseISO(dateStr);
  if (isValid(parsedDate)) {
    return new TZDateMini(parsedDate.getTime(), deviceTimeZone);
  }
  
  for (const formatStr of COMMON_DATE_FORMATS) {
    parsedDate = parse(dateStr, formatStr, new Date());
    if (isValid(parsedDate)) {
      return new TZDateMini(parsedDate.getTime(), deviceTimeZone);
    }
  }
  
  // Final fallback
  parsedDate = new Date(dateStr);
  return isValid(parsedDate) ? new TZDateMini(parsedDate.getTime(), deviceTimeZone) : null;
};

/**
 * Safely parses a date and checks for validity.
 * Returns null if the date is invalid.
 */
const getValidDate = (date: Date | string | number | null | undefined): Date | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isValid(date) ? new TZDateMini(date.getTime(), deviceTimeZone) : null;
  }
  
  if (typeof date === 'number') {
    const parsedDate = new Date(date);
    return isValid(parsedDate) ? new TZDateMini(parsedDate.getTime(), deviceTimeZone) : null;
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
  const formatted = format(validDate, "MMMM do yyyy, h:mm a", {
    locale: activeLocale,
  });
  // Handle potential '0:mm AM' display bug
  return formatted.replace(/\b0:(\d{2}) AM\b/g, '12:$1 AM');
};

/**
 * Format: "hh:mm a dd/MM/yyyy"
 * Example: "10:00 PM 24/08/2026"
 */
export const formatTimeWithDate = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  const formatted = format(validDate, "hh:mm a dd/MM/yyyy", {
    locale: activeLocale,
  });
  // Handle potential '00:mm AM' display bug
  return formatted.replace(/\b00:(\d{2}) AM\b/g, '12:$1 AM');
};

/**
 * Format: "dd/MM/yyyy"
 * Example: "24/08/2026"
 */
export const formatDateShortYear = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "dd/MM/yyyy", {
    locale: activeLocale,
  });
};

/**
 * Format: "d MMM, EEE, h:mm a"
 * Example: "24 Aug, Mon, 10:00 PM"
 */
export const formatWithOrdinalAndDay = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  const formatted = format(validDate, "d MMM, EEE, h:mm a", {
    locale: activeLocale,
  });
  // Handle potential '0:mm AM' display bug
  return formatted.replace(/\b0:(\d{2}) AM\b/g, '12:$1 AM');
};

/**
 * Format: "dd MMM"
 * Example: "24 Aug"
 */
export const formatDateShort = (date: Date | string | number | null | undefined): string => {
  const validDate = getValidDate(date);
  if (!validDate) return '';
  return format(validDate, "dd MMM", {
    locale: activeLocale,
  });
};

/**
 * Gets the current year.
 * Example: 2026
 */
export const getCurrentYear = (): number => {
  return getYear(new Date());
};
