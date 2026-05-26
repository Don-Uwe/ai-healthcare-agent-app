/**
 * SecureStorageUtils.ts
 *
 * Abstraction layer for sensitive credential storage.
 * Currently backed by AsyncStorage; can be migrated to expo-secure-store
 * or react-native-keychain for encrypted storage in the future.
 *
 * All token-related storage MUST go through these helpers to:
 * 1. Centralize token access for easy security upgrades
 * 2. Validate token values before storage (prevent storing undefined/null)
 * 3. Provide type-safe keys for sensitive data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Keys for securely stored sensitive data */
export const SECURE_KEYS = {
  USER_TOKEN: 'SECURE_USER_TOKEN',
} as const;

type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

/**
 * Store a sensitive value securely.
 * Validates that the value is a non-empty string before persisting.
 * Returns true on success, false on failure.
 */
export const secureStoreItem = async (
  key: SecureKey,
  value: string,
): Promise<boolean> => {
  try {
    if (!value || typeof value !== 'string') {
      console.warn(`[SecureStorage] Attempted to store invalid value for key: ${key}`);
      return false;
    }
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error storing key "${key}":`, error);
    return false;
  }
};

/**
 * Retrieve a sensitive value from secure storage.
 * Returns the value if it exists and is non-empty, otherwise null.
 */
export const secureRetrieveItem = async (
  key: SecureKey,
): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    // Return null for empty/whitespace-only values to prevent "Bearer " headers
    if (!value || value.trim().length === 0) {
      return null;
    }
    return value;
  } catch (error) {
    console.error(`[SecureStorage] Error retrieving key "${key}":`, error);
    return null;
  }
};

/**
 * Remove a sensitive value from secure storage.
 * Used during logout or session expiry to ensure tokens are fully cleared.
 */
export const secureRemoveItem = async (key: SecureKey): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error removing key "${key}":`, error);
    return false;
  }
};
