import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';

import messaging, { firebase } from '@react-native-firebase/messaging'; 
 
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const androidConfig = {
  appId: extra.FIREBASE_APP_ID,
  apiKey: extra.FIREBASE_API_KEY,
  databaseURL: extra.FIREBASE_DATABASE_URL,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_SENDER_ID,
  projectId: extra.FIREBASE_PROJECT_ID,
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
        if (!androidConfig.apiKey || !androidConfig.appId) {
          if (__DEV__) {
            console.warn('Firebase configuration is incomplete. Skipping Firebase initialization.');
          }
          return;
        }

        if (!firebase.apps.length) {
          await firebase.initializeApp(androidConfig);
        } else {
          firebase.app(); // if already initialized, use that one
        }
        const token = await messaging().getToken();
        if (__DEV__) {
          console.log('Firebase Token:', token);
        }
        setFcmToken(token); // Store the token in state
      } catch (error) {
        if (__DEV__) {
          console.error('Error getting token:', error);
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