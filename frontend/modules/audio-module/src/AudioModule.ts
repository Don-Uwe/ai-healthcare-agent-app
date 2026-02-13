import { NativeModule, requireNativeModule } from 'expo';

import { AudioModuleEvents } from './AudioModule.types';

declare class AudioModule extends NativeModule<AudioModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AudioModule>('AudioModule');
