import {Platform} from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import {
  secureRetrieveItem,
  secureStoreItem,
  SECURE_KEYS,
} from './SecureStorageUtils';
import {REGISTER_PUSH_TOKEN} from './APIUtils';

export const registerExpoPushTokenAsync = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  try {
    const response = await Notifications.getExpoPushTokenAsync();
    const token = response.data;

    if (token) {
      await secureStoreItem(SECURE_KEYS.EXPO_PUSH_TOKEN, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('Failed to get Expo push token:', error);
    return null;
  }
};

export const getStoredExpoPushToken = async (): Promise<string | null> => {
  return secureRetrieveItem(SECURE_KEYS.EXPO_PUSH_TOKEN);
};

export const syncExpoPushTokenWithServer = async (
  userToken?: string | null,
): Promise<void> => {
  if (!userToken) {
    return;
  }

  const token = await getStoredExpoPushToken();
  if (!token) {
    return;
  }

  try {
    const headers: Record<string, string> = {};
    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    await axios.post(
      REGISTER_PUSH_TOKEN,
      { expoPushToken: token },
      { headers },
    );
  } catch (error) {
    console.error('Failed to register push token with server:', error);
  }
};

export const registerAndSyncPushToken = async (
  userToken?: string | null,
): Promise<void> => {
  const token = await registerExpoPushTokenAsync();
  if (!token) {
    return;
  }

  if (userToken) {
    await syncExpoPushTokenWithServer(userToken);
  }
};
