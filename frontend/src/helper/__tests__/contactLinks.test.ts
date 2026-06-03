import {
  buildMailLink,
  buildPhoneLink,
  normalizePhoneNumberForLink,
} from '../contactLinks';

describe('contactLinks', () => {
  describe('normalizePhoneNumberForLink', () => {
    it('normalizes local Indian phone numbers for tel links', () => {
      expect(normalizePhoneNumberForLink('98765 43210')).toBe('+919876543210');
      expect(normalizePhoneNumberForLink('91234 56789')).toBe('+919123456789');
    });

    it('preserves explicit country codes while removing formatting characters', () => {
      expect(normalizePhoneNumberForLink('+1 (555) 123-4567')).toBe('+15551234567');
      expect(normalizePhoneNumberForLink('+91 98765 43210')).toBe('+919876543210');
      expect(normalizePhoneNumberForLink('91-98765-43210')).toBe('+919876543210');
    });

    it('normalizes Indian numbers that already include the 91 country code', () => {
      expect(normalizePhoneNumberForLink('91 98765 43210')).toBe('+919876543210');
    });

    it('normalizes common international dialing prefixes without adding the Indian country code', () => {
      expect(normalizePhoneNumberForLink('0015551234567')).toBe('+15551234567');
    });

    it('normalizes local Indian numbers with a trunk prefix', () => {
      expect(normalizePhoneNumberForLink('09876543210')).toBe('+919876543210');
    });

    it('returns null for empty or non-numeric phone values', () => {
      expect(normalizePhoneNumberForLink('')).toBeNull();
      expect(normalizePhoneNumberForLink('call me')).toBeNull();
      expect(normalizePhoneNumberForLink(undefined)).toBeNull();
    });
  });

  describe('buildPhoneLink', () => {
    it('builds android tel links without whitespace', () => {
      expect(buildPhoneLink('98765 43210', 'android')).toBe('tel:+919876543210');
    });

    it('builds non-android telprompt links without whitespace', () => {
      expect(buildPhoneLink('98765-43210', 'ios')).toBe('telprompt:+919876543210');
    });
  });

  describe('buildMailLink', () => {
    it('builds mailto links without a space after the scheme', () => {
      expect(buildMailLink(' doctor@example.com ')).toBe('mailto:doctor@example.com');
    });

    it('removes accidental whitespace inside email values', () => {
      expect(buildMailLink('doctor @example.com')).toBe('mailto:doctor@example.com');
    });

    it('does not URI-encode the normalized email address', () => {
      expect(buildMailLink('doctor{team}@example.com')).toBe(
        'mailto:doctor{team}@example.com',
      );
    });

    it('returns null for empty email values', () => {
      expect(buildMailLink('   ')).toBeNull();
      expect(buildMailLink(undefined)).toBeNull();
    });
  });
});
