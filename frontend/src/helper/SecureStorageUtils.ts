import * as SecureStore from 'expo-secure-store';

/**
 * SecureStorageUtils.ts
 *
 * Abstraction layer for sensitive credential storage.
 * Uses Expo SecureStore for encrypted key-value storage.
 */

export const SECURE_KEYS = {
  USER_TOKEN: 'SECURE_USER_TOKEN',
} as const;

type SecureKey = (typeof SECURE_KEYS)[keyof typeof SECURE_KEYS];

export const secureStoreItem = async (
  key: SecureKey,
  value: string,
): Promise<boolean> => {
  try {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      console.warn(`[SecureStorage] Attempted to store invalid value for key: ${key}`);
      return false;
    }

    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error storing key "${key}":`, error);
    return false;
  }
};

export const secureRetrieveItem = async (
  key: SecureKey,
): Promise<string | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (!value || value.trim().length === 0) {
      return null;
    }
    return value;
  } catch (error) {
    console.error(`[SecureStorage] Error retrieving key "${key}":`, error);
    return null;
  }
};

export const secureRemoveItem = async (key: SecureKey): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error removing key "${key}":`, error);
    return false;
  }
};
export const secureClearAllItems = async (): Promise<void> => {
  try {
    await Promise.all(
      Object.values(SECURE_KEYS).map(key => SecureStore.deleteItemAsync(key))
    );
  } catch (error) {
    console.error('[SecureStorage] Error clearing all items:', error);
  }
};