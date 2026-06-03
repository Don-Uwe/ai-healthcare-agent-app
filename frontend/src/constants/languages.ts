/**
 * Languages constant - 13 Indian languages
 * Used for filtering articles and podcasts by language preference
 * Format: BCP-47 language codes with India country code (xx-IN)
 */

export const INDIAN_LANGUAGES = [
  { name: 'English (India)', code: 'en-IN' },
  { name: 'Hindi', code: 'hi-IN' },
  { name: 'Bengali', code: 'bn-IN' },
  { name: 'Tamil', code: 'ta-IN' },
  { name: 'Telugu', code: 'te-IN' },
  { name: 'Marathi', code: 'mr-IN' },
  { name: 'Gujarati', code: 'gu-IN' },
  { name: 'Kannada', code: 'kn-IN' },
  { name: 'Malayalam', code: 'ml-IN' },
  { name: 'Punjabi', code: 'pa-IN' },
  { name: 'Odia', code: 'or-IN' },
  { name: 'Assamese', code: 'as-IN' },
  { name: 'Urdu (India)', code: 'ur-IN' },
] as const;

export type LanguageCode = typeof INDIAN_LANGUAGES[number]['code'];

/**
 * Get language name by code
 */
export const getLanguageName = (code: string): string => {
  const lang = INDIAN_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

/**
 * Validate if code is a valid language code
 */
export const isValidLanguageCode = (code: string): boolean => {
  return INDIAN_LANGUAGES.some(l => l.code === code);
};
