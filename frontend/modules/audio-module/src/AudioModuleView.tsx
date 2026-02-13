import { requireNativeView } from 'expo';
import * as React from 'react';

import { AudioModuleViewProps } from './AudioModule.types';

const NativeView: React.ComponentType<AudioModuleViewProps> =
  requireNativeView('AudioModule');

export default function AudioModuleView(props: AudioModuleViewProps) {
  return <NativeView {...props} />;
}
