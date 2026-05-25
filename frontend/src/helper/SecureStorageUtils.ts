import * as SecureStore from 'expo-secure-store';

// Expo SecureStore is a wrapper around Android Keystore and iOS Keychain.
// It securely encrypts and stores key-value pairs.

export const secureRetrieveItem = async (key: string) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (e) {
    console.log('Error reading secure value', e);
    return null;
  }
};

export const secureStoreItem = async (key: string, value: string) => {
  try {
  
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.log('Secure Storage Data error', e);
  }
};

export const secureRemoveItem = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing secure item:', error);
  }
};
