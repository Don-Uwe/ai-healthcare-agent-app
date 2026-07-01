declare module 'expo-secure-store';
declare module 'expo-device';
declare module 'react-native-html-to-pdf';
declare module 'react-native-version-check';
declare module 'react-native-tts';
declare module 'react-native-snackbar';
declare module '@brown-bear/react-native-autoheight-webview';
declare module 'qrcode-terminal';
declare module 'react-native-gifted-charts';

declare module '*.mp3' {
  const value: number;
  export default value;
}

declare module '*.svg' {
  import type React from 'react';
  import type {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.jsx' {
  import type React from 'react';
  const component: React.ComponentType<Record<string, unknown>>;
  export default component;
}
