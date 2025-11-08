import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './AudioModule.types';

type AudioModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class AudioModule extends NativeModule<AudioModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(AudioModule, 'AudioModule');
