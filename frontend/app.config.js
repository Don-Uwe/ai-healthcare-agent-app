// Dynamic Expo config — merges with and extends app.json
//
// Set environment variables in your .env file (see .env.example).
// Expo CLI picks up .env automatically when running `expo start` / `expo build`.

const defaultStaticConfig = {
  name: "UltimateHealth",
  slug: "UltimateHealth",
  version: "2.2.0",
  orientation: "portrait",
  icon: "./assets/images/ic_ultimatehealth_appicon.png",
  scheme: "ultimatehealth",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  androidStatusBar: {
    backgroundColor: "#00BFFF",
    barStyle: "light-content"
  },
  splash: {
    image: "./assets/images/adaptive-icon.png",
    resizeMode: "contain",
    backgroundColor: "#E6F4FE"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.UltimateHealth",
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      NSMicrophoneUsageDescription: "App requires microphone access to record audio.",
      NSPhotoLibraryAddUsageDescription: "App needs access to save recordings.",
      NSPhotoLibraryUsageDescription: "App needs access to select or manage audio files.",
      UIBackgroundModes: ["audio"]
    }
  },
  android: {
    permissions: [
      "INTERNET",
      "RECORD_AUDIO",
      "VIBRATE",
      "RECEIVE_BOOT_COMPLETED",
      "POST_NOTIFICATIONS",
      "READ_MEDIA_AUDIO",
      "MODIFY_AUDIO_SETTINGS"
    ],
    blockedPermissions: [
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.READ_PHONE_STATE",
    ],
    allowBackup: false,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        category: ["BROWSABLE", "DEFAULT"],
        data: [
          {
            scheme: "https",
            host: "uhsocial.in",
            pathPrefix: "/api/share/article"
          },
          {
            scheme: "https",
            host: "uhsocial.in",
            pathPrefix: "/api/share/podcast"
          }
        ]
      }
    ],
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/ic_ultimatehealth_appicon_foreground.png",
      backgroundImage: "./assets/images/ic_launcher_background.png"
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.anonymous.UltimateHealth",
    versionCode: 21
  },
  web: {
    output: "single",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "@react-native-firebase/app",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/adaptive-icon.png",
        imageWidth: 100,
        resizeMode: "contain",
        backgroundColor: "#E6F4FE",
        dark: {
          image: "./assets/images/adaptive-icon.png",
          backgroundColor: "#1A1A1A"
        }
      }
    ],
    [
      "expo-audio",
      {
        microphonePermission: "Allow UltimateHealth to access your microphone."
      }
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 26
        }
      }
    ],
    "./plugins/withWebViewDebug.js"
  ],
  experiments: {
    reactCompiler: true
  },
  extra: {
    eas: {
      projectId: "bdd3feee-d70b-4f27-9be5-33edb8b864f4"
    }
  }
};

module.exports = ({ config }) => {
  const mergedConfig = {
    ...defaultStaticConfig,
    ...config,
  };

  // Filter out "@sentry/react-native/expo" if present in base config plugins,
  // to avoid duplication when we append our dynamically configured version.
  const basePlugins = (mergedConfig.plugins || []).filter(
    (p) => (typeof p === "string" ? p : p[0]) !== "@sentry/react-native/expo"
  );

  return {
    ...mergedConfig,
    plugins: [
      ...basePlugins,
      [
        "@sentry/react-native/expo",
        {
          organization: "ultimatehealth",
          project: "ultimatehealth",
          enableNative: true,
          disableAutoUpload: process.env.EAS_BUILD !== "true"
        }
      ]
    ],
    extra: {
      ...mergedConfig.extra,
      // API URLs — read from environment variables with production fallbacks.
      // Override these in your local .env file (see .env.example).
      PROD_URL:
        process.env.PROD_URL ?? "https://uhsocial.in/api",
      SOCKET_PROD:
        process.env.SOCKET_PROD ?? "https://uhsocial.in",
      CONTENT_CHECKER_PROD:
        process.env.CONTENT_CHECKER_PROD ?? "https://uhsocial.in/content-intel",
      FIREBASE_API_KEY_ANDROID: process.env.FIREBASE_API_KEY_ANDROID,
      FIREBASE_API_KEY_IOS: process.env.FIREBASE_API_KEY_IOS,
      FIREBASE_APP_ID_ANDROID: process.env.FIREBASE_APP_ID_ANDROID,
      FIREBASE_APP_ID_IOS: process.env.FIREBASE_APP_ID_IOS,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_SENDER_ID: process.env.FIREBASE_SENDER_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    }
  };
};
