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
    return null;
  }
};

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
  }
};
