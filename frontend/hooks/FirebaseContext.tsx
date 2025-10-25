import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';

import messaging from '@react-native-firebase/messaging'; 
import { firebase } from '@react-native-firebase/messaging'; 


const androidConfig = {
  appId: `1:393228544987:web:1f4134206db6c1f36395fe`,
  apiKey: `AIzaSyBtxfBmAVd4g3_yk6ufTLknK_AFiyN8k0M`,
  databaseURL: `https://ultimatehealth-255dc.firebaseio.com`,
  storageBucket: `ultimatehealth-255dc.firebasestorage.app`,
  messagingSenderId: `393228544987`,
  projectId: `ultimatehealth-255dc`,
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
        if (!firebase.apps.length) {
         await firebase.initializeApp(androidConfig);
       }else {
         firebase.app(); // if already initialized, use that one
       }
        //await firebase.initializeApp(androidConfig);
        const token = await messaging().getToken();
        console.log('Firebase Token:', token);
        setFcmToken(token); // Store the token in state
      } catch (error) {
        console.error('Error getting token:', error);
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