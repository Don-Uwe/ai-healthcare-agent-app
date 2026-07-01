import Constants from 'expo-constants';

type ExpoExtra = {
  PROD_URL?: string;
  SOCKET_PROD?: string;
  CONTENT_CHECKER_PROD?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

/** Production API base URL injected via Expo config / .env */
export const apiBaseUrl = extra.PROD_URL ?? 'https://uhsocial.in/api';

/** WebSocket server URL */
export const socketUrl = extra.SOCKET_PROD ?? 'https://uhsocial.in';

/** Content intelligence service URL */
export const contentCheckerUrl =
  extra.CONTENT_CHECKER_PROD ?? 'https://uhsocial.in/content-intel';

export const appConfig = {
  apiBaseUrl,
  socketUrl,
  contentCheckerUrl,
} as const;
