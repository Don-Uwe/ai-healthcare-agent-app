import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { Platform } from 'react-native';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging'; 
import Constants from 'expo-constants';
import { logger } from '../src/services/monitoring/logger';

const extra = Constants.expoConfig?.extra ?? {};

// Firebase configuration loaded dynamically from environment variables via expo-constants.
// This single configuration object is platform-agnostic and serves both iOS and Android.
const firebaseConfig = {
  appId: Platform.select({
    ios: extra.FIREBASE_APP_ID_IOS,
    android: extra.FIREBASE_APP_ID_ANDROID,
    default: extra.FIREBASE_APP_ID_ANDROID,
  }),
  apiKey: Platform.select({
    ios: extra.FIREBASE_API_KEY_IOS,
    android: extra.FIREBASE_API_KEY_ANDROID,
    default: extra.FIREBASE_API_KEY_ANDROID,
  }),
  databaseURL: extra.FIREBASE_DATABASE_URL,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_SENDER_ID,
  projectId: extra.FIREBASE_PROJECT_ID,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  measurementId: extra.FIREBASE_MEASUREMENT_ID,
  persistence: true,
};


// Define the type for the FirebaseContext
const FirebaseContext = createContext<{
  messaging: typeof messaging | null;
  fcmToken: string | null;
}>({ messaging: null, fcmToken: null }); // We add fcmToken to the context

// Define the type for FirebaseProvider props (expecting children)
interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      // Initialize Firebase
      try {
        const requiredFields = [
          'apiKey',
          'appId',
          'projectId',
          'messagingSenderId',
        ];

        const missingFields = requiredFields.filter(
          (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
        );

        if (missingFields.length > 0) {
          logger.warn(
            `Firebase configuration is incomplete. Missing fields: ${missingFields.join(
              ', '
            )}. Skipping Firebase initialization.`
          );
          return;
        }

        if (!firebase.apps.length) {
          await firebase.initializeApp(firebaseConfig);
        } else {
          firebase.app(); // if already initialized, use that one
        }
        const token = await messaging().getToken();
        if (token) {
          logger.log('Firebase Token:', token);
        }
        setFcmToken(token); // Store the token in state
      } catch (error) {
        if (logger) {
          logger.error('Error getting token:', error);
        }
      }
    };

    initializeFirebase();

    return () => {
      // Cleanup if necessary (e.g., unsubscribe from listeners)
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ messaging, fcmToken }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to access Firebase messaging and token
export const useFirebaseMessaging = (): { messaging: typeof messaging | null; fcmToken: string | null } => {
  return useContext(FirebaseContext);
};