<<<<<<< HEAD
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
=======
import * as SecureStore from 'expo-secure-store';
import {SECURE_KEYS} from './Utils';

// Expo SecureStore is a wrapper around Android Keystore and iOS Keychain.
// It securely encrypts and stores key-value pairs.

export const secureRetrieveItem = async (key: string) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (e) {
    console.error(`Error reading secure value for key (redacted):`, e); // Redact key
>>>>>>> 50b9380e24c7a2c8761533207ac9ad780e3873ee
    return null;
  }
};

<<<<<<< HEAD
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
=======
export const secureStoreItem = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.error(`Error storing secure value for key (redacted):`, e); // Redact key
  }
};

export const secureRemoveItem = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error removing secure item for key (redacted):`, error); // Redact key
  }
};

export const secureClearAllItems = async () => {
  try {
    const secureKeysToClear = [SECURE_KEYS.USER_TOKEN];
    await Promise.all(
      secureKeysToClear.map(key => SecureStore.deleteItemAsync(key)),
    );
    console.log('All secure items cleared.');
  } catch (error) {
    console.error('Error clearing all secure items:', error);
>>>>>>> 50b9380e24c7a2c8761533207ac9ad780e3873ee
  }
};
