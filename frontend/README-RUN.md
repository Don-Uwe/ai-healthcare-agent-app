# Frontend run instructions

Prerequisites
- Node.js (16+ recommended)
- npm or yarn
- For native builds: Android Studio / Xcode (optional for run:android/run:ios)
- For push notifications: run on a physical device; configure FCM for Android

Quick start

1. Install dependencies

```bash
cd frontend
npm install
# or
# yarn
```

2. Run the app

```bash
npm run start
# or
# expo start
```

3. Run on Android device/emulator

```bash
npm run android
```

4. Run preflight check (useful if you see errors in the editor)

```bash
node ./scripts/check-environment.js
```

Notes
- If your editor still shows TypeScript errors after these steps, restart the TypeScript server or reload VS Code.
- Expo push notifications require FCM setup for Android (google-services.json) and testing on a physical device for Expo push tokens.
