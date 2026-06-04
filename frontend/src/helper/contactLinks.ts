import type {PlatformOSType} from 'react-native';

type ContactLinkPlatform = PlatformOSType;

export const normalizePhoneNumberForLink = (
  phone: string | null | undefined,
): string | null => {
  const rawPhone = phone?.trim();

  if (!rawPhone) {
    return null;
  }

  const digitsOnly = rawPhone.replace(/\D/g, '');

  if (!digitsOnly) {
    return null;
  }

  if (rawPhone.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.startsWith('00')) {
    const internationalNumber = digitsOnly.slice(2);
    return internationalNumber ? `+${internationalNumber}` : null;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+91${digitsOnly.slice(1)}`;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  return `+91${digitsOnly}`;
};

export const buildPhoneLink = (
  phone: string | null | undefined,
  platform: ContactLinkPlatform,
): string | null => {
  const normalizedPhone = normalizePhoneNumberForLink(phone);

  if (!normalizedPhone) {
    return null;
  }

  const scheme = platform === 'android' ? 'tel' : 'telprompt';
  return `${scheme}:${normalizedPhone}`;
};

export const buildMailLink = (mail: string | null | undefined): string | null => {
  const normalizedMail = mail?.trim().replace(/\s+/g, '');

  if (!normalizedMail) {
    return null;
  }

  return `mailto:${normalizedMail}`;
};
