import { TZDateMini } from '@date-fns/tz';
import {
  parseDbTimestamp,
  formatDateWithTime,
  formatTimeWithDate,
  formatDateShortYear,
  formatWithOrdinalAndDay,
  formatDateShort,
} from '../dateUtils';

jest.mock('expo-localization', () => ({
  getCalendars: jest.fn(() => [{ timeZone: 'UTC' }]),
  getLocales: jest.fn(() => [{ languageTag: 'en-US' }])
}));

describe('dateUtils', () => {
  describe('parseDbTimestamp', () => {
    it('safely parses timestamps with missing timezone suffixes as local time', () => {
      const parsed = parseDbTimestamp('2026-05-26 14:30:00');
      // Since deviceTimeZone mock is UTC, local time equals UTC in this test context
      expect(parsed?.toISOString()).toBe('2026-05-26T14:30:00.000Z');
    });

    it('safely parses timestamps with existing Z', () => {
      const parsed = parseDbTimestamp('2026-05-26T14:30:00.000Z');
      expect(parsed?.toISOString()).toBe('2026-05-26T14:30:00.000Z');
    });

    it('safely parses timestamps with explicit offset', () => {
      const parsed = parseDbTimestamp('2026-05-26T14:30:00+05:30');
      // 14:30 +05:30 is 09:00 UTC
      expect(parsed?.toISOString()).toBe('2026-05-26T09:00:00.000Z');
    });

    it('returns null for invalid dates', () => {
      const parsed = parseDbTimestamp('invalid-date');
      expect(parsed).toBeNull();
    });
  });

  describe('formatting', () => {
    it('formats formatDateWithTime correctly', () => {
      // 2026-05-26T14:30:00Z formatted in UTC
      const formatted = formatDateWithTime('2026-05-26T14:30:00Z');
      expect(formatted).toBe('May 26th 2026, 2:30 PM');

      expect(formatDateWithTime(null)).toBe('');
      expect(formatDateWithTime(undefined)).toBe('');
      expect(formatDateWithTime('invalid')).toBe('');
    });

    it('formats formatTimeWithDate correctly', () => {
      const formatted = formatTimeWithDate('2026-05-26T14:30:00Z');
      expect(formatted).toBe('02:30 PM 26/05/2026');

      expect(formatTimeWithDate(null)).toBe('');
      expect(formatTimeWithDate(undefined)).toBe('');
      expect(formatTimeWithDate('invalid')).toBe('');
    });

    it('formats formatDateShortYear correctly', () => {
      const formatted = formatDateShortYear('2026-05-26T14:30:00Z');
      expect(formatted).toBe('26/05/2026');

      expect(formatDateShortYear(null)).toBe('');
      expect(formatDateShortYear(undefined)).toBe('');
      expect(formatDateShortYear('invalid')).toBe('');
    });

    it('formats formatWithOrdinalAndDay correctly', () => {
      const formatted = formatWithOrdinalAndDay('2026-05-26T14:30:00Z');
      // 2026-05-26 is a Tuesday
      expect(formatted).toBe('26 May, Tue, 2:30 PM');

      expect(formatWithOrdinalAndDay(null)).toBe('');
      expect(formatWithOrdinalAndDay(undefined)).toBe('');
      expect(formatWithOrdinalAndDay('invalid')).toBe('');
    });

    it('formats formatDateShort correctly', () => {
      const formatted = formatDateShort('2026-05-26T14:30:00Z');
      expect(formatted).toBe('26 May');

      expect(formatDateShort(null)).toBe('');
      expect(formatDateShort(undefined)).toBe('');
      expect(formatDateShort('invalid')).toBe('');
    });
  });

  describe('timezone mock behavior', () => {
    it('formats dates correctly in America/New_York', () => {
      jest.resetModules();
      jest.doMock('expo-localization', () => ({
        getCalendars: jest.fn(() => [{ timeZone: 'America/New_York' }]),
        getLocales: jest.fn(() => [{ languageTag: 'en-US' }])
      }));

      const { formatDateWithTime } = require('../dateUtils');
      // 2026-05-26 is in Daylight Saving Time (EDT) which is UTC-4
      // 14:30 UTC is 10:30 AM EDT
      const formatted = formatDateWithTime('2026-05-26T14:30:00Z');
      expect(formatted).toContain('10:30 AM');
    });
  });
});
